import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import useValidation from '../../../hooks/useValidation';

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#0ea5e9', '#f59e0b',
    '#10b981', '#ef4444', '#f97316', '#06b6d4',
];

const schema = {
    name:        { required: true, minLength: 2, maxLength: 255 },
    slug:        { required: false, maxLength: 255 },
    description: { required: false, maxLength: 500 },
};

export default function CategoryForm({ category }) {
    const isEdit = !!category;
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
        color: category?.color || '#6366f1',
        sort_order: category?.sort_order ?? 0,
    });

    const { clientErrors, validate, touchAll } = useValidation(schema, data);

    const submit = (e) => {
        e.preventDefault();
        if (!touchAll(data)) return;
        const options = {
            onSuccess: () => toast.success('Category saved successfully!'),
            onError: () => toast.error('Please fix the errors and try again.'),
        };
        isEdit ? put(`/admin/categories/${category.id}`, options) : post('/admin/categories', options);
    };

    const nameError = clientErrors.name || errors.name;
    const slugError = clientErrors.slug || errors.slug;
    const descriptionError = clientErrors.description || errors.description;

    return (
        <AdminLayout title={isEdit ? 'Edit Category' : 'New Category'}>

            <div className="max-w-lg">
                <Link href="/admin/categories" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5">
                    <ArrowLeft size={14} /> Back
                </Link>

                <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => { setData('name', e.target.value); validate('name', e.target.value); }}
                            onBlur={e => validate('name', e.target.value, true)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${nameError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:ring-indigo-300 bg-white'}`}
                            placeholder="Category name"
                        />
                        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Slug</label>
                        <input
                            type="text"
                            value={data.slug}
                            onChange={e => { setData('slug', e.target.value); validate('slug', e.target.value); }}
                            onBlur={e => validate('slug', e.target.value, true)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition font-mono ${slugError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:ring-indigo-300 bg-white'}`}
                            placeholder="auto-generated"
                        />
                        {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                        <input
                            type="text"
                            value={data.description}
                            onChange={e => { setData('description', e.target.value); validate('description', e.target.value); }}
                            onBlur={e => validate('description', e.target.value, true)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${descriptionError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:ring-indigo-300 bg-white'}`}
                            placeholder="Short description..."
                        />
                        {descriptionError && <p className="text-xs text-red-500 mt-1">{descriptionError}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setData('color', color)}
                                    className={`w-7 h-7 rounded-full border-2 transition-transform ${data.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <input
                                type="color"
                                value={data.color}
                                onChange={e => setData('color', e.target.value)}
                                className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                                title="Custom color"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Sort Order</label>
                        <input
                            type="number"
                            value={data.sort_order}
                            onChange={e => setData('sort_order', parseInt(e.target.value))}
                            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            min={0}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={13} />
                            {processing ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
