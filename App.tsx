import React, { useState } from 'react';
import type { BrandProfile, ImageFile, GenerationResult, ChatMessage, StyleSuggestion } from './types';
import { generateCharacterImage, getStyleSuggestion } from './services/geminiService';

import Header from './components/Header';
import Footer from './components/Footer';
import ApiSettings from './components/ApiSettings';
import ImageUploader from './components/ImageUploader';
import RecipeForm from './components/RecipeForm';
import RecipeDisplay from './components/RecipeDisplay';
import ResultsSection from './components/ResultsSection';
import SectionDivider from './components/SectionDivider';
import AssistantButton from './components/AssistantButton';
import AssistantModal from './components/AssistantModal';

const initialBrandProfile: BrandProfile = {
    proportion: '',
    material: '',
    face_shape: '',
    eyebrows: '',
    eyes: '',
    lips: '',
    nose: '',
    hair_hijab: '',
    accessories: '',
    outfit: '',
    outfit_color: '',
    lighting: '',
    specificDetails: '',
    characterName: '',
};

const App: React.FC = () => {
    const [brandProfile, setBrandProfile] = useState<BrandProfile>(initialBrandProfile);
    const [faceImage, setFaceImage] = useState<ImageFile | null>(null);
    const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
    const [pose, setPose] = useState<string>('');
    const [angle, setAngle] = useState<string>('');
    const [background, setBackground] = useState<string>('');
    const [generationResult, setGenerationResult] = useState<GenerationResult>({ isLoading: false });
    const [addWatermark, setAddWatermark] = useState(true);
    const [resolution, setResolution] = useState('1k');
    const [apiKeySource, setApiKeySource] = useState<'default' | 'custom'>('default');
    const [customApiKey, setCustomApiKey] = useState<string>('');

    // State for AI Assistant
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            id: 'init1',
            role: 'assistant',
            text: 'Halo! Saya Asisten AI MHR. Unggah foto referensi (jika ada), lalu ceritakan karakter seperti apa yang ingin Anda buat, dan saya akan bantu meracik resep visualnya!',
        }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setBrandProfile(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleImageUpload = (file: File, type: 'face' | 'style') => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            const newImageFile: ImageFile = {
                name: file.name,
                data: base64String,
                mimeType: file.type,
                previewUrl: URL.createObjectURL(file),
            };
            if (type === 'face') setFaceImage(newImageFile);
            else setStyleImage(newImageFile);
        };
        reader.readAsDataURL(file);
    };

    const handleImageRemove = (type: 'face' | 'style') => {
        const imageFile = type === 'face' ? faceImage : styleImage;
        if (imageFile) URL.revokeObjectURL(imageFile.previewUrl);
        if (type === 'face') setFaceImage(null);
        else setStyleImage(null);
    };

    const buildPrompt = (): string => {
        const {
            characterName, proportion, material, face_shape, eyebrows, eyes, lips, nose,
            hair_hijab, accessories, outfit, outfit_color, lighting, specificDetails
        } = brandProfile;
    
        const blueprint = `
            - **Character Name**: "${characterName || 'Unnamed'}"
            - **Core Style**: A '${proportion}' character, rendered in a '${material}' style.
            - **Face Blueprint**: '${face_shape}' face, '${eyebrows}' eyebrows, '${eyes}' eyes, '${nose}' nose, '${lips}' lips.
            - **Styling Blueprint**: '${hair_hijab}' with '${accessories}'.
            - **OUTFIT BLUEPRINT (PERMANENT)**: The character ALWAYS wears a '${outfit}' style outfit with the color scheme '${outfit_color}'. This is NON-NEGOTIABLE. Do not change the outfit for any reason, even if the pose seems to suggest different clothing. For example, if the pose is 'swimming', the character must be depicted swimming in this exact outfit.
            - **Lighting Blueprint**: Lit with '${lighting}'.
            - **Additional Blueprint Details**: ${specificDetails ? `Must include: "${specificDetails}".` : 'None.'}
        `.trim().replace(/^ +/gm, '');
    
        let referenceImageInstructions = '';
        if (faceImage) {
            referenceImageInstructions += `\n- **Face Reference Rule**: Use the face reference ONLY for facial structure. IGNORE its photographic style. Apply the Style Blueprint ('${material}') to the face structure.`;
        }
        if (styleImage) {
            referenceImageInstructions += `\n- **Style Reference Rule**: Use the style reference ONLY for artistic texture and color palette. DO NOT copy its subject matter.`;
        }
    
        return `
**PRIMARY DIRECTIVE: ABSOLUTE CHARACTER CONSISTENCY**

You are a meticulous character artist. Your mission is to render a single, pre-defined character in a new scene. The character's design is **LOCKED** and **IMMUTABLE**. Your only task is to change the scene composition (pose, angle, background).

**STEP 1: MEMORIZE THE UNCHANGEABLE CHARACTER BLUEPRINT**
This is the character's permanent design. It must be followed with 100% accuracy in every detail.
${blueprint}

**STEP 2: REVIEW THE REFERENCE IMAGE RULES (IF ANY)**
${referenceImageInstructions || '- No reference images provided. Adhere strictly to the text Blueprint.'}

**STEP 3: COMPOSE THE NEW SCENE**
Take the exact character from the Blueprint and place them in this new composition. DO NOT ALTER THE BLUEPRINT.
- **Pose**: ${pose || 'neutral standing pose'}
- **Camera Angle**: ${angle || 'eye-level shot'}
- **Background**: ${background || 'plain neutral background'}

**FINAL COMMAND & QUALITY CHECK:**
Generate a ${resolution} image. ${addWatermark ? 'Add a discreet "MHR Studio" watermark.' : 'No watermark.'} Before finalizing, verify: Does the character's outfit, face, and style in the output image EXACTLY match the **UNCHANGEABLE CHARACTER BLUEPRINT**? If not, you have failed. The only elements that should differ from a previous generation are the Pose, Camera Angle, and Background.
        `.trim();
    };


    const handleGenerateImage = async () => {
        setGenerationResult({ isLoading: true, error: undefined, src: undefined });
        const effectiveApiKey = apiKeySource === 'custom' ? customApiKey : undefined;

        try {
            const prompt = buildPrompt();
            const generatedData = await generateCharacterImage(prompt, faceImage, styleImage, effectiveApiKey);
            const src = `data:image/png;base64,${generatedData}`;
            setGenerationResult({ src, isLoading: false });
        } catch (error: any) {
            setGenerationResult({ error: error.message, isLoading: false });
        }
    };

    const handleSendMessage = async (message: string, image?: ImageFile | null) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: message,
            imagePreviewUrl: image?.previewUrl,
        };
        setChatHistory(prev => [...prev, userMessage]);
        setIsAssistantLoading(true);

        const effectiveApiKey = apiKeySource === 'custom' ? customApiKey : undefined;

        try {
            const { explanation, profile } = await getStyleSuggestion(message, faceImage, styleImage, image, effectiveApiKey);
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: explanation,
                suggestion: profile,
            };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: `Maaf, terjadi kesalahan: ${error.message}`,
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsAssistantLoading(false);
            // Revoke object URL after processing to prevent memory leaks
            if (image?.previewUrl) {
                URL.revokeObjectURL(image.previewUrl);
            }
        }
    };

    const handleApplyStyle = (suggestion: StyleSuggestion) => {
        const { pose: suggestedPose, angle: suggestedAngle, background: suggestedBackground, ...profileSuggestion } = suggestion;

        setBrandProfile(prev => ({ ...prev, ...profileSuggestion }));

        if (suggestedPose) setPose(suggestedPose);
        if (suggestedAngle) setAngle(suggestedAngle);
        if (suggestedBackground) setBackground(suggestedBackground);
        
        setIsAssistantOpen(false);
    };
    
    const isGenerationDisabled = generationResult.isLoading || (apiKeySource === 'custom' && !customApiKey);

    return (
        <div className="bg-orange-50/20 min-h-screen font-sans text-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
                <Header />
                <ApiSettings
                    apiKeySource={apiKeySource}
                    setApiKeySource={setApiKeySource}
                    customApiKey={customApiKey}
                    setCustomApiKey={setCustomApiKey}
                />
                <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200/50 space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-2 text-slate-900">1. Foto Referensi Wajah (Opsional)</h2>
                        <p className="text-gray-500 mb-4">Upload foto wajah yang jelas (close-up) untuk dijadikan referensi. Hasil tidak akan 100% mirip, namun akan mengikuti bentuk dasar wajah.</p>
                        <ImageUploader type="face" imageFile={faceImage} onUpload={handleImageUpload} onRemove={handleImageRemove} uploadPrompt="Klik untuk upload foto referensi wajah" />
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold mb-2 text-slate-900">2. Foto Referensi Style (Opsional)</h2>
                        <p className="text-gray-500 mb-4">Upload gambar yang memiliki style visual (goresan, warna, tekstur) yang kamu inginkan untuk ditiru oleh AI.</p>
                        <ImageUploader type="style" imageFile={styleImage} onUpload={handleImageUpload} onRemove={handleImageRemove} uploadPrompt="Klik untuk upload foto referensi style" />
                    </section>

                    <SectionDivider />
                    
                    <RecipeForm brandProfile={brandProfile} handleInputChange={handleInputChange} />

                    <SectionDivider />

                    <RecipeDisplay brandProfile={brandProfile} />

                    <SectionDivider />

                    <ResultsSection 
                        characterName={brandProfile.characterName}
                        pose={pose} angle={angle} background={background}
                        setPose={setPose} setAngle={setAngle} setBackground={setBackground}
                        onGenerate={handleGenerateImage} result={generationResult}
                        addWatermark={addWatermark} setAddWatermark={setAddWatermark}
                        resolution={resolution} setResolution={setResolution}
                        isGenerationDisabled={isGenerationDisabled}
                    />
                </main>
                <Footer />
            </div>
            <AssistantButton onClick={() => setIsAssistantOpen(true)} />
            <AssistantModal
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                onApplyStyle={handleApplyStyle}
                isLoading={isAssistantLoading}
            />
        </div>
    );
};

export default App;