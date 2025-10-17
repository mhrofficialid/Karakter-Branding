// Fix: Removed circular import of 'BrandProfile' which caused a conflict.
// Fix: Add SelectOption and OptionGroup to centralize types.
export interface SelectOption {
    value: string;
    label: string;
}

export interface OptionGroup {
    label: string;
    options: SelectOption[];
}

export interface BrandProfile {
    proportion: string;
    material: string;
    face_shape: string;
    eyebrows: string;
    eyes: string;
    lips: string;
    nose: string;
    hair_hijab: string;
    accessories: string;
    outfit: string;
    outfit_color: string;
    lighting: string;
    specificDetails: string;
    characterName: string;
}

export interface ImageFile {
    name: string;
    data: string; // base64 encoded string
    mimeType: string;
    previewUrl: string;
}

export interface GenerationResult {
    src?: string;
    error?: string;
    isLoading: boolean;
}

export interface StyleSuggestion extends Partial<BrandProfile> {
    pose?: string;
    angle?: string;
    background?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    suggestion?: StyleSuggestion;
    imagePreviewUrl?: string;
}
