import React from 'react';
// Fix: Import centralized types to avoid conflicts.
import type { GenerationResult, OptionGroup, SelectOption } from '../types';
import { poseOptions, angleOptions, backgroundOptions, resolutionOptions } from '../constants';
import Loader from './Loader';

interface ResultsSectionProps {
    characterName: string;
    pose: string;
    angle: string;
    background: string;
    setPose: (value: string) => void;
    setAngle: (value: string) => void;
    setBackground: (value: string) => void;
    onGenerate: () => void;
    result: GenerationResult;
    addWatermark: boolean;
    setAddWatermark: (value: boolean) => void;
    resolution: string;
    setResolution: (value: string) => void;
    isGenerationDisabled: boolean;
}

// Helper function for grouped selects
const isOptionGroup = (option: SelectOption | OptionGroup): option is OptionGroup => {
    return (option as OptionGroup).options !== undefined;
};


const ResultsSection: React.FC<ResultsSectionProps> = ({
    characterName, pose, angle, background,
    setPose, setAngle, setBackground,
    onGenerate, result,
    addWatermark, setAddWatermark,
    resolution, setResolution,
    isGenerationDisabled
}) => {

    const handleSaveImage = () => {
        if (!result.src) return;
        const link = document.createElement('a');
        link.href = result.src;
        const safePose = pose.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${characterName.replace(/\s+/g, '_')}-${safePose}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section>
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-slate-900">Uji Coba Resep Visual Anda</h2>
                <p className="text-gray-500 mt-1 mb-6">Tambahkan detail fleksibel (pose, angle, background) lalu buat gambar.</p>
            </div>
            
            <div className="bg-amber-50/50 p-6 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resep yang Bisa Diubah (Pose, Angle, Background)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select
                            value={pose}
                            onChange={(e) => setPose(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            <option value="" disabled>Pilih Pose...</option>
                            {/* Fix: Correctly map over poseOptions as it's an array of OptionGroup */}
                            {poseOptions.map((opt, index) => (
                                <optgroup label={opt.label} key={`${opt.label}-${index}`}>
                                    {opt.options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                                </optgroup>
                            ))}
                        </select>
                        <select
                            value={angle}
                            onChange={(e) => setAngle(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            <option value="" disabled>Pilih Angle...</option>
                             {angleOptions.map((opt, index) => (
                                <optgroup label={opt.label} key={`${opt.label}-${index}`}>
                                    {opt.options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                                </optgroup>
                            ))}
                        </select>
                        <select
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            <option value="" disabled>Pilih Background...</option>
                             {backgroundOptions.map((opt, index) => (
                                <optgroup label={opt.label} key={`${opt.label}-${index}`}>
                                    {opt.options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <label htmlFor="resolution-select" className="block text-sm font-medium text-gray-700 mb-2">Kualitas Gambar</label>
                        <select
                            id="resolution-select"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            {resolutionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start sm:pt-7">
                         <input
                            id="watermark-checkbox"
                            type="checkbox"
                            checked={addWatermark}
                            onChange={(e) => setAddWatermark(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor="watermark-checkbox" className="ml-2 block text-sm text-gray-900">
                            Tampilkan Watermark MHR Studio
                        </label>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button 
                        onClick={onGenerate}
                        disabled={isGenerationDisabled}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {result.isLoading ? 'Memproses...' : 'Buat Gambar Karakter ✨'}
                    </button>
                </div>
                <div className="mt-6 text-center">
                    <div className="w-full max-w-md mx-auto min-h-[256px] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 p-2">
                        {result.isLoading ? (
                            <Loader />
                        ) : result.error ? (
                            <div className="text-center p-4">
                                <p className="text-sm text-red-600 font-semibold">Gagal Membuat Gambar</p>
                                <p className="text-xs text-gray-500 mt-1">{result.error}</p>
                            </div>
                        ) : result.src ? (
                            <img src={result.src} alt="Generated brand character" className="rounded-lg shadow-md max-w-full h-auto" />
                        ) : (
                             <p className="text-sm text-gray-400">Gambar akan muncul di sini</p>
                        )}
                    </div>
                     {result.src && !result.isLoading && (
                        <div className="mt-4">
                             <button 
                                onClick={handleSaveImage}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-shadow duration-300 transform hover:scale-105"
                            >
                                Simpan Gambar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ResultsSection;