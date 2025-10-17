
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { ImageFile, StyleSuggestion } from '../types';
import {
    proportionOptions, materialOptions, faceOptions, eyebrowOptions, eyesOptions, lipsOptions,
    noseOptions, hairHijabOptions, accessoriesOptions, outfitOptions, lightingOptions,
    poseOptions, angleOptions, backgroundOptions
} from '../constants';

export const generateCharacterImage = async (
    prompt: string,
    faceImage: ImageFile | null,
    styleImage: ImageFile | null,
    apiKey: string | undefined
): Promise<string> => {

    const effectiveApiKey = apiKey || process.env.API_KEY;

    if (!effectiveApiKey) {
        throw new Error("API Key tidak tersedia. Silakan masukkan API Key pribadi Anda di pengaturan atau pastikan variabel lingkungan API_KEY sudah diatur.");
    }
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    const parts: any[] = [{ text: prompt }];

    if (faceImage) {
        parts.push({
            inlineData: {
                mimeType: faceImage.mimeType,
                data: faceImage.data,
            },
        });
    }

    if (styleImage) {
        parts.push({
            inlineData: {
                mimeType: styleImage.mimeType,
                data: styleImage.data,
            },
        });
    }

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const candidate = result.candidates?.[0];

        if (!candidate) {
            throw new Error('Respon tidak valid dari API. Tidak ada kandidat gambar.');
        }

        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Gambar tidak dapat dibuat karena alasan keamanan. Coba ubah resep atau pose Anda.');
        }

        const imagePart = candidate.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        } else {
            // Check for text part which might contain an error or explanation
            const textPart = candidate.content?.parts?.find(p => p.text);
            if (textPart?.text) {
                throw new Error(`API tidak mengembalikan gambar. Pesan: ${textPart.text}`);
            }
            throw new Error('Respon API berhasil, namun tidak ada data gambar yang ditemukan.');
        }

    } catch (error: any) {
        console.error("Gemini API Error:", error);

        if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            let friendlyMessage = "Batas penggunaan API telah tercapai (Quota Exceeded). Ini biasa terjadi saat trafik sedang tinggi. Silakan coba lagi nanti, atau gunakan API Key pribadi Anda di Pengaturan untuk akses prioritas.";
            
            try {
                // The error message from the API is often a JSON string.
                // Let's find the start of the JSON object.
                const jsonStartIndex = error.message.indexOf('{');
                if (jsonStartIndex > -1) {
                    const jsonString = error.message.substring(jsonStartIndex);
                    const errorObj = JSON.parse(jsonString);
                    const retryInfo = errorObj?.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                    
                    if (retryInfo?.retryDelay) {
                        friendlyMessage = `Batas penggunaan API telah tercapai. Server menyarankan untuk mencoba lagi dalam ${retryInfo.retryDelay}. Untuk menghindari antrian, Anda bisa menggunakan API Key pribadi di Pengaturan.`;
                    }
                }
            } catch (e) {
                // Could not parse JSON, stick with the default friendly message.
                console.warn("Could not parse API error message as JSON.", e);
            }
            
            throw new Error(friendlyMessage);
        }

        if (error.message && error.message.includes('API key not valid')) {
            throw new Error('API Key pribadi yang Anda masukkan tidak valid. Mohon periksa kembali atau gunakan API MHR Studio (Default).');
        }

        throw new Error(error.message || "Gagal menghubungi Gemini API.");
    }
};

export const getStyleSuggestion = async (
    userPrompt: string,
    faceImage: ImageFile | null,
    styleImage: ImageFile | null,
    chatImage: ImageFile | null,
    apiKey: string | undefined
): Promise<{ explanation: string; profile: StyleSuggestion }> => {
    const effectiveApiKey = apiKey || process.env.API_KEY;
    if (!effectiveApiKey) {
        throw new Error("API Key tidak tersedia. Silakan masukkan API Key pribadi Anda di pengaturan atau pastikan variabel lingkungan API_KEY sudah diatur.");
    }
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    const allOptions = `
      AVAILABLE OPTIONS (Choose values from these lists):
      - proportion: [${proportionOptions.map(o => `"${o.value}"`).join(', ')}]
      - material: [${materialOptions.flatMap(g => g.options).map(o => `"${o.value}"`).join(', ')}]
      - face_shape: [${faceOptions.map(o => `"${o.value}"`).join(', ')}]
      - eyebrows: [${eyebrowOptions.map(o => `"${o.value}"`).join(', ')}]
      - eyes: [${eyesOptions.map(o => `"${o.value}"`).join(', ')}]
      - lips: [${lipsOptions.map(o => `"${o.value}"`).join(', ')}]
      - nose: [${noseOptions.map(o => `"${o.value}"`).join(', ')}]
      - hair_hijab: [${hairHijabOptions.flatMap(g => g.options).map(o => `"${o.value}"`).join(', ')}]
      - accessories: [${accessoriesOptions.flatMap(g => 'options' in g ? g.options : [g]).map(o => `"${o.value}"`).join(', ')}]
      - outfit: [${outfitOptions.flatMap(g => g.options).map(o => `"${o.value}"`).join(', ')}]
      - lighting: [${lightingOptions.map(o => `"${o.value}"`).join(', ')}]
      - pose: [${poseOptions.flatMap(g => g.options).map(o => `"${o.value}"`).join(', ')}]
      - angle: [${angleOptions.flatMap(g => g.options).map(o => `"${o.value}"`).join(', ')}]
      - background: [${backgroundOptions.flatMap(g => g.options).map(o => `"${o.value}"`).join(', ')}]
    `;

    const systemInstruction = `You are an expert creative assistant for a branding character generator. Your task is to help the user create a complete "visual recipe" and a "test scene".
      1. Analyze the user's request and any provided reference images to understand the desired character aesthetic.
      2. **Main Recipe:**
          - Suggest a creative and fitting 'characterName'.
          - Select the MOST SUITABLE option for each main visual recipe category (proportion, material, face, etc.) from the provided lists.
          - Suggest relevant 'specificDetails' that would enhance the character (e.g., "hijab warna biru langit", "tulisan 'Creator' di kaos"). Keep it concise.
      3. **Test Scene:**
          - To bring the character to life, select the BEST 'pose', 'angle', and 'background' from their respective lists that match the user's request and the character's persona.
      4. **Explanation:** Provide a friendly, conversational explanation in Indonesian for all your choices (both main recipe and test scene).
      5. **Format:** You MUST return your response in a specific JSON format.
      ${allOptions}`;

    const fullUserPrompt = `User's request: "${userPrompt}". Please generate the visual recipe and test scene based on my request and any provided images (main references and the one I just uploaded with this message).`;
    
    const parts: any[] = [{ text: fullUserPrompt }];

    if (faceImage) {
        parts.push({ inlineData: { mimeType: faceImage.mimeType, data: faceImage.data } });
    }
    if (styleImage) {
        parts.push({ inlineData: { mimeType: styleImage.mimeType, data: styleImage.data } });
    }
    if (chatImage) {
        parts.push({ inlineData: { mimeType: chatImage.mimeType, data: chatImage.data } });
    }

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            explanation: {
                type: Type.STRING,
                description: "A friendly explanation of the suggested style choices, written in Indonesian.",
            },
            profile: {
                type: Type.OBJECT,
                description: "The selected options for the visual recipe and test scene. All values MUST be one of the provided options.",
                properties: {
                    proportion: { type: Type.STRING }, material: { type: Type.STRING },
                    face_shape: { type: Type.STRING }, eyebrows: { type: Type.STRING },
                    eyes: { type: Type.STRING }, lips: { type: Type.STRING }, nose: { type: Type.STRING },
                    hair_hijab: { type: Type.STRING }, accessories: { type: Type.STRING },
                    outfit: { type: Type.STRING }, lighting: { type: Type.STRING },
                    characterName: { type: Type.STRING, description: "A creative name for the character based on the user's prompt." },
                    specificDetails: { type: Type.STRING, description: "Specific details to add, like non-outfit colors or text on clothes. Keep it concise." },
                    pose: { type: Type.STRING },
                    angle: { type: Type.STRING },
                    background: { type: Type.STRING },
                },
            },
        },
        required: ['explanation', 'profile'],
    };

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = result.text.trim();
        return JSON.parse(jsonText);
    } catch (error: any) {
        console.error("Gemini Style Suggestion Error:", error);
        
        if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("Batas penggunaan API untuk Asisten AI telah tercapai. Silakan coba lagi nanti, atau gunakan API Key pribadi Anda di Pengaturan untuk akses prioritas.");
        }

        if (error.message && error.message.includes('API key not valid')) {
            throw new Error('API Key pribadi yang Anda masukkan tidak valid. Mohon periksa kembali atau gunakan API MHR Studio (Default).');
        }

        throw new Error(error.message || "Gagal mendapatkan saran dari Asisten AI.");
    }
};
