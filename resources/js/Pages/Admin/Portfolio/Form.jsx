import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import useValidation from '../../../hooks/useValidation';

const schema = {
    title:      { required: true, minLength: 2, maxLength: 255 },
    short_desc: { required: true, minLength: 5, maxLength: 255 },
    long_desc:  { required: true, minLength: 10 },
    live_url:   { required: false, type: 'url' },
};

export default function PortfolioForm({ item }) {
    const isEdit = !!item;
    const [techInput, setTechInput] = useState('');
    const [preview, setPreview] = useState(item?.image_path ? `/storage/${item.image_path}` : null);
    const fileRef = useRef(null);

    const { data, setData, post, put, processing, errors } = useForm({
        title: item?.title ?? '',
        short_desc: item?.short_desc ?? '',
        long_desc: item?.long_desc ?? '',
        tech_stack: item?.tech_stack ?? [],
        live_url: item?.live_url ?? '',
        is_featured: item?.is_featured ?? false,
        is_published: item?.is_published ?? false,
        order: item?.order ?? 0,
        image: null,
    });

    const { clientErrors, validate, touchAll } = useValidation(schema, data);

    const submit = (e) => {
        e.preventDefault();
        if (!touchAll(data)) return;
        const options = {
            forceFormData: true,
            onSuccess: () => toast.success('Portfolio item saved successfully!'),
            onError: () => toast.error('Please fix the errors and try again.'),
        };
        if (isEdit) {
            post(`/admin/portfolio/${item.id}?_method=PUT`, options);
        } else {
            post('/admin/portfolio', options);
        }
    };

    const addTech = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && techInput.trim()) {
            e.preventDefault();
            const tag = techInput.trim().replace(/,$/, '');
            if (tag && !data.tech_stack.includes(tag)) {
                setData('tech_stack', [...data.tech_stack, tag]);
            }
            setTechInput('');
        }
    };

    const removeTech = (tag) => {
        setData('tech_stack', data.tech_stack.filter((t) => t !== tag));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const titleError = clientErrors.title || errors.title;
    const shortDescError = clientErrors.short_desc || errors.short_desc;
    const longDescError = clientErrors.long_desc || errors.long_desc;
    const liveUrlError = clientErrors.live_url || errors.live_url;

    const inputClass = (hasError) =>
        `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition ${
            hasError
                ? 'border-red-300 focus:ring-red-200 bg-red-50/30'
                : 'border-gray-200 focus:ring-indigo-300'
        }`;

    return (
        <AdminLayout title={isEdit ? 'Edit Portfolio Item' : 'New Portfolio Item'}>
            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-5">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => { setData('title', e.target.value); validate('title', e.target.value); }}
                            onBlur={(e) => validate('title', e.target.value, true)}
                            placeholder="Project name"
                            className={inputClass(titleError)}
                        />
                        {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
                    </div>

                    {/* Short Desc */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Short Description <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.short_desc}
                            onChange={(e) => { setData('short_desc', e.target.value); validate('short_desc', e.target.value); }}
                            onBlur={(e) => validate('short_desc', e.target.value, true)}
                            placeholder="One-line summary shown on portfolio grid"
                            className={inputClass(shortDescError)}
                        />
                        {shortDescError && <p className="text-xs text-red-500 mt-1">{shortDescError}</p>}
                    </div>

                    {/* Long Desc */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Full Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={data.long_desc}
                            onChange={(e) => { setData('long_desc', e.target.value); validate('long_desc', e.target.value); }}
                            onBlur={(e) => validate('long_desc', e.target.value, true)}
                            rows={6}
                            placeholder="Detailed description of the project..."
                            className={`${inputClass(longDescError)} resize-none`}
                        />
                        {longDescError && <p className="text-xs text-red-500 mt-1">{longDescError}</p>}
                    </div>

                    {/* Tech Stack */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Tech Stack</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {data.tech_stack.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                                    {tag}
                                    <button type="button" onClick={() => removeTech(tag)}>
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={addTech}
                            placeholder="Type and press Enter to add (e.g. React, Laravel)"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition"
                        />
                    </div>

                    {/* Live URL */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Live URL</label>
                        <input
                            type="url"
                            value={data.live_url}
                            onChange={(e) => { setData('live_url', e.target.value); validate('live_url', e.target.value); }}
                            onBlur={(e) => validate('live_url', e.target.value, true)}
                            placeholder="https://..."
                            className={inputClass(liveUrlError)}
                        />
                        {liveUrlError && <p className="text-xs text-red-500 mt-1">{liveUrlError}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Cover Image <span className="text-gray-400">(max 2MB, jpg/png/webp)</span>
                        </label>
                        {preview && (
                            <img src={preview} alt="preview" className="w-full max-h-48 object-cover rounded-lg mb-2 bg-gray-100" />
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpg,image/jpeg,image/png,image/webp"
                            onChange={handleImage}
                            className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Display Order</label>
                        <input
                            type="number"
                            min="0"
                            value={data.order}
                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">Lower number = shown first</p>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
                            />
                            <span className="text-sm text-gray-700">Published</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
                            />
                            <span className="text-sm text-gray-700">Featured on homepage</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
                        </button>
                        <a
                            href="/admin/portfolio"
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
