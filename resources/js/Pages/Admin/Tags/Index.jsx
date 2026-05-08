import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';

export default function TagsIndex({ tags }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/tags', { onSuccess: () => reset() });
    };

    return (
        <AdminLayout title="Tags">
            

            <div className="max-w-lg space-y-5">
                {/* Add tag form */}
                <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add New Tag</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="Tag name..."
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Plus size={14} /> Add
                        </button>
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </form>

                {/* Tags list */}
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <div
                                key={tag.id}
                                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1"
                            >
                                <TagIcon size={11} className="text-gray-400" />
                                <span className="text-sm text-gray-700">{tag.name}</span>
                                <span className="text-xs text-gray-400">({tag.articles_count})</span>
                                <button
                                    onClick={() => {
                                        if (confirm(`Delete tag "${tag.name}"?`)) {
                                            router.delete(`/admin/tags/${tag.id}`);
                                        }
                                    }}
                                    className="text-gray-300 hover:text-red-500 transition-colors ml-0.5"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {tags.length === 0 && (
                            <p className="text-sm text-gray-400 py-2">No tags yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
