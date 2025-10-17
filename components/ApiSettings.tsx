import React, { useState } from 'react';

interface ApiSettingsProps {
    apiKeySource: 'default' | 'custom';
    setApiKeySource: (source: 'default' | 'custom') => void;
    customApiKey: string;
    setCustomApiKey: (key: string) => void;
}

const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0l-.1.41a2 2 0 01-1.42 1.42l-.41.1c-1.56.38-1.56 2.6 0 2.98l.41.1a2 2 0 011.42 1.42l.1.41c.38 1.56 2.6 1.56 2.98 0l.1-.41a2 2 0 011.42-1.42l.41-.1c1.56-.38 1.56-2.6 0-2.98l-.41-.1a2 2 0 01-1.42-1.42l-.1-.41zM10 5a5 5 0 100 10 5 5 0 000-10zM10 8a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
    </svg>
);


const ApiSettings: React.FC<ApiSettingsProps> = ({ apiKeySource, setApiKeySource, customApiKey, setCustomApiKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    return (
        <div className="mb-6 bg-white p-4 rounded-2xl shadow-lg border border-stone-200/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left font-semibold text-slate-800"
                aria-expanded={isOpen}
                aria-controls="api-settings-panel"
            >
                <span className="flex items-center">
                    <GearIcon className="w-5 h-5 mr-2 text-slate-500" />
                    Pengaturan API Key
                </span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </button>
            {isOpen && (
                <div id="api-settings-panel" className="mt-4 pt-4 border-t border-stone-200">
                    <p className="text-sm text-gray-600 mb-4">
                        Generator ini menggunakan API Key MHR Studio. Saat trafik tinggi, proses generate mungkin melambat. Untuk pengalaman yang lebih cepat dan stabil, kami sangat menyarankan untuk menggunakan API Key Google Gemini Anda sendiri.
                        {' '}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-semibold">
                            Dapatkan API Key gratis di sini.
                        </a>
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="default-key"
                                name="apiKeySource"
                                value="default"
                                checked={apiKeySource === 'default'}
                                onChange={() => setApiKeySource('default')}
                                className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                            />
                            <label htmlFor="default-key" className="ml-2 block text-sm font-medium text-gray-700">
                                Gunakan API MHR Studio (Default)
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="custom-key"
                                name="apiKeySource"
                                value="custom"
                                checked={apiKeySource === 'custom'}
                                onChange={() => setApiKeySource('custom')}
                                className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                            />
                            <label htmlFor="custom-key" className="ml-2 block text-sm font-medium text-gray-700">
                                Gunakan API Key Pribadi
                            </label>
                        </div>
                    </div>
                    {apiKeySource === 'custom' && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-1">
                                    Google Gemini API Key Anda
                                </label>
                                <input
                                    id="api-key-input"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={customApiKey}
                                    onChange={(e) => setCustomApiKey(e.target.value)}
                                    placeholder="Masukkan Google Gemini API Key Anda di sini"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    aria-required="true"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="show-api-key"
                                        type="checkbox"
                                        checked={showApiKey}
                                        onChange={(e) => setShowApiKey(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <label htmlFor="show-api-key" className="ml-2 block text-sm text-gray-900">
                                        Tampilkan API Key
                                    </label>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={!customApiKey}
                                    className="bg-orange-500 text-white font-semibold text-sm py-1 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Konfirmasi API Key"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ApiSettings;