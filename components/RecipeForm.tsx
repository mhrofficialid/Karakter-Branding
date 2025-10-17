import React from 'react';
// Fix: Import centralized types to avoid conflicts.
import type { BrandProfile, OptionGroup, SelectOption } from '../types';
import {
    proportionOptions, materialOptions, faceOptions, eyebrowOptions, eyesOptions, lipsOptions,
    noseOptions, hairHijabOptions, accessoriesOptions, outfitOptions, lightingOptions
} from '../constants';
import SectionDivider from './SectionDivider';

interface RecipeFormProps {
    brandProfile: BrandProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const isOptionGroup = (option: SelectOption | OptionGroup): option is OptionGroup => {
    return (option as OptionGroup).options !== undefined;
};

const SelectInput: React.FC<{ id: keyof BrandProfile, label: string, value: string, options: (SelectOption | OptionGroup)[], onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ id, label, value, options, onChange }) => (
    <div>
        <label htmlFor={id} className="block font-semibold text-orange-900 mb-2">{label}</label>
        <select id={id} value={value} onChange={onChange} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
            <option value="" disabled>Pilih...</option>
            {options.map((opt, index) => {
                if (isOptionGroup(opt)) {
                    return (
                        <optgroup label={opt.label} key={`${opt.label}-${index}`}>
                            {opt.options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </optgroup>
                    );
                } else if (opt.value && opt.label) {
                    return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                }
                return null;
            })}
        </select>
    </div>
);

const RecipeForm: React.FC<RecipeFormProps> = ({ brandProfile, handleInputChange }) => {
    return (
        <>
            <section>
                <h2 className="text-2xl font-semibold mb-2 text-slate-900">3. Racik Bahan Utama Resep Visual Anda</h2>
                <p className="text-gray-500 mb-6">Pilih bahan-bahan utama yang akan menjadi identitas permanen karakter Anda.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <SelectInput id="proportion" label="1. Proporsi Tubuh" value={brandProfile.proportion} options={proportionOptions} onChange={handleInputChange} />
                    <SelectInput id="material" label="2. Material & Tekstur" value={brandProfile.material} options={materialOptions} onChange={handleInputChange} />
                    <SelectInput id="face_shape" label="3. Bentuk Wajah" value={brandProfile.face_shape} options={faceOptions} onChange={handleInputChange} />
                    <SelectInput id="eyebrows" label="4. Alis" value={brandProfile.eyebrows} options={eyebrowOptions} onChange={handleInputChange} />
                    <SelectInput id="eyes" label="5. Mata" value={brandProfile.eyes} options={eyesOptions} onChange={handleInputChange} />
                    <SelectInput id="lips" label="6. Bibir" value={brandProfile.lips} options={lipsOptions} onChange={handleInputChange} />
                    <SelectInput id="nose" label="7. Hidung" value={brandProfile.nose} options={noseOptions} onChange={handleInputChange} />
                    <SelectInput id="hair_hijab" label="8. Rambut / Hijab" value={brandProfile.hair_hijab} options={hairHijabOptions} onChange={handleInputChange} />
                    <SelectInput id="accessories" label="9. Aksesoris" value={brandProfile.accessories} options={accessoriesOptions} onChange={handleInputChange} />
                    <SelectInput id="outfit" label="10. Outfit" value={brandProfile.outfit} options={outfitOptions} onChange={handleInputChange} />
                    <div>
                        <label htmlFor="outfit_color" className="block font-semibold text-orange-900 mb-2">11. Warna Outfit</label>
                        <input type="text" id="outfit_color" value={brandProfile.outfit_color} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Contoh: Baju Merah, Celana Biru" />
                    </div>
                    <SelectInput id="lighting" label="12. Kualitas Visual" value={brandProfile.lighting} options={lightingOptions} onChange={handleInputChange} />
                </div>
            </section>

            <SectionDivider />

            <section>
                 <h2 className="text-2xl font-semibold mb-2 text-slate-900">4. Detail Akhir & Nama Karakter</h2>
                 <p className="text-gray-500 mb-6">Tambahkan sentuhan akhir yang membuat karakter Anda unik.</p>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="characterName" className="block font-semibold text-orange-900 mb-2">Nama Karakter / Julukan</label>
                        <input type="text" id="characterName" value={brandProfile.characterName} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Contoh : MHR Kids" />
                    </div>
                    <div>
                        <label htmlFor="specificDetails" className="block font-semibold text-orange-900 mb-2">Detail Spesifik (Warna detail motif tambahan, Non-Outfit, Sepatu, Tulisan, dll) (Opsional)</label>
                        <textarea id="specificDetails" value={brandProfile.specificDetails} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" rows={4} placeholder="Contoh: Hijab anak warna pink pastel, clean dan simple..."></textarea>
                    </div>
                </div>
            </section>
        </>
    );
};

export default RecipeForm;