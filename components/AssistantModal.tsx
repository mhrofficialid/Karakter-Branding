import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { ChatMessage, StyleSuggestion, ImageFile } from '../types';
import Loader from './Loader';

interface AssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string, image?: ImageFile | null) => void;
    onApplyStyle: (suggestion: StyleSuggestion) => void;
    isLoading: boolean;
}

const PaperclipIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 117.44 9.545l3.45-3.55a.75.75 0 111.061 1.06l-3.45 3.55a1.125 1.125 0 001.59 1.591l3.456-3.554a3 3 0 000-4.242z" clipRule="evenodd" />
    </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M3.105 3.105a.75.75 0 011.06 0L10 8.94l5.835-5.835a.75.75 0 111.06 1.06L11.06 10l5.835 5.835a.75.75 0 11-1.06 1.06L10 11.06l-5.835 5.835a.75.75 0 01-1.06-1.06L8.94 10 3.105 4.165a.75.75 0 010-1.06z" transform="rotate(45 10 10) scale(0.9)" />
    </svg>
);


const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, messages, onSendMessage, onApplyStyle, isLoading }) => {
    const [input, setInput] = useState('');
    const [imageToSend, setImageToSend] = useState<ImageFile | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRoot = document.getElementById('modal-root');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = () => {
        if (input.trim() || imageToSend) {
            onSendMessage(input.trim(), imageToSend);
            setInput('');
            setImageToSend(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                const newImageFile: ImageFile = {
                    name: file.name,
                    data: base64String,
                    mimeType: file.type,
                    previewUrl: URL.createObjectURL(file),
                };
                setImageToSend(newImageFile);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        if (imageToSend) {
            URL.revokeObjectURL(imageToSend.previewUrl);
        }
        setImageToSend(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }

    if (!isOpen || !modalRoot) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-slate-800">Asisten AI MHR</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-2xl leading-none">&times;</button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-xl px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-slate-800'}`}>
                                {msg.imagePreviewUrl && (
                                    <img src={msg.imagePreviewUrl} alt="User upload preview" className="rounded-lg mb-2 max-h-40" />
                                )}
                                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                {msg.role === 'assistant' && msg.suggestion && (
                                     <button
                                        onClick={() => onApplyStyle(msg.suggestion!)}
                                        className="mt-3 w-full bg-slate-100 text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                                    >
                                        Terapkan Gaya
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="rounded-xl px-4 py-2 max-w-sm bg-gray-200 text-slate-800">
                                 <Loader />
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-gray-200">
                     {imageToSend && (
                        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <img src={imageToSend.previewUrl} alt="Preview" className="w-10 h-10 rounded-md object-cover" />
                                <span className="text-xs text-gray-500 truncate">{imageToSend.name}</span>
                            </div>
                            <button onClick={removeImage} className="text-red-500 hover:text-red-700 font-bold p-1">&times;</button>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/png, image/jpeg, image/webp" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
                            <PaperclipIcon />
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Minta saran gaya..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-blue-500 text-white rounded-lg p-2 disabled:opacity-50"
                        >
                           <SendIcon />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, modalRoot);
};

export default AssistantModal;