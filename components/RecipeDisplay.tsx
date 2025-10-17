import React, { useState, useEffect } from 'react';
import type { BrandProfile } from '../types';

const generateReadableRecipe = (profile: BrandProfile): string => {
    const faceDetails = [
        profile.face_shape,
        profile.eyebrows,
        profile.eyes,
        profile.lips,
        profile.nose
    ].filter(Boolean).join(', ');

    let recipe = `Resep Visual Karakter: ${profile.characterName || '[NAMA KARAKTER]'}

1. Proporsi Tubuh: ${profile.proportion}
2. Material & Tekstur: ${profile.material}
3. Wajah: ${faceDetails}
4. Rambut / Hijab: ${profile.hair_hijab}
5. Aksesoris: ${profile.accessories}
6. Outfit: ${profile.outfit}
7. Warna Outfit: ${profile.outfit_color}
8. Kualitas Visual: ${profile.lighting}
`;

    if (profile.specificDetails) {
        recipe += `\nDetail Spesifik Tambahan: ${profile.specificDetails}`;
    }

    return recipe.trim();
};


const RecipeDisplay: React.FC<{ brandProfile: BrandProfile }> = ({ brandProfile }) => {
    const [recipeText, setRecipeText] = useState('');
    const [copyFeedback, setCopyFeedback] = useState('');

    useEffect(() => {
        const text = generateReadableRecipe(brandProfile);
        setRecipeText(text);
    }, [brandProfile]);

    const handleCopy = () => {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = recipeText;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopyFeedback('Berhasil disalin!');
                setTimeout(() => setCopyFeedback(''), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
                setCopyFeedback('Gagal menyalin.');
                 setTimeout(() => setCopyFeedback(''), 2000);
            }
            return;
        }

        navigator.clipboard.writeText(recipeText).then(() => {
            setCopyFeedback('Berhasil disalin!');
            setTimeout(() => setCopyFeedback(''), 2000);
        }).catch(err => {
            console.error('Gagal menyalin teks: ', err);
            setCopyFeedback('Gagal menyalin.');
            setTimeout(() => setCopyFeedback(''), 2000);
        });
    };

    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-700">
                🎨 Resep Visual Anda Siap! 🎨
            </h2>
            <div className="bg-amber-50/50 p-4 rounded-lg">
                <label htmlFor="recipe-prompt" className="text-lg font-semibold text-slate-800">Template Resep Visual Final</label>
                <textarea
                    id="recipe-prompt"
                    className="w-full p-3 mt-2 font-mono text-sm bg-slate-800 text-green-400 border border-slate-600 rounded-lg"
                    rows={12}
                    value={recipeText}
                    readOnly
                />
                <button
                    onClick={handleCopy}
                    className="mt-4 w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition-shadow duration-300"
                >
                    Salin Resep Visual
                </button>
                <p className="text-sm text-green-600 mt-2 h-4 text-center">{copyFeedback}</p>
            </div>
        </section>
    );
};

export default RecipeDisplay;