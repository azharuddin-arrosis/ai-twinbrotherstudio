import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Plus, Trash2, RefreshCw, Circle } from 'lucide-react';

function formatDate(d) {
    if (!d) return 'Never';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function RssSourcesIndex({ sources, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        url: '',
        category_id: '',
        fetch_interval_hours: 6,
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/rss-sources', { onSuccess: () => reset() });
    };

    const toggleActive = (source) => {
        router.put(`/admin/rss-sources/${source.id}`, {
            ...source,
            category_id: source.category_id,
            is_active: !source.is_active,
        });
    };

    return (
        <AdminLayout title="RSS Sources">
            

            <div className="space-y-5">
                {/* Add form */}
                <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Add RSS Source</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="TechCrunch AI"
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">RSS Feed URL</label>
                            <input
                                type="url"
                                value={data.url}
                                onChange={e => setData('url', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                                placeholder="https://..."
                            />
                            {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Default Category</label>
                            <select
                                value={data.category_id}
                                onChange={e => setData('category_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                            >
                                <option value="">None</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Fetch Interval (hours)</label>
                            <input
                                type="number"
                                value={data.fetch_interval_hours}
                                onChange={e => setData('fetch_interval_hours', parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                min={1} max={168}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Plus size={14} /> Add Source
                    </button>
                </form>

                {/* Sources list */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Source</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Last Fetched</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sources.map(source => (
                                <tr key={source.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{source.name}</p>
                                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{source.url}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                                        {source.category?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                                        {formatDate(source.last_fetched_at)}
                                        <span className="text-gray-300 ml-1">({source.fetch_interval_hours}h)</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleActive(source)}
                                            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                                                source.is_active
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            <Circle size={8} className={source.is_active ? 'fill-green-500' : 'fill-gray-400'} />
                                            {source.is_active ? 'Active' : 'Paused'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <button
                                                onClick={() => router.post(`/admin/rss-sources/${source.id}/fetch`)}
                                                className="p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                                title="Fetch now"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete "${source.name}"?`)) {
                                                        router.delete(`/admin/rss-sources/${source.id}`);
                                                    }
                                                }}
                                                className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sources.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                                        No RSS sources yet. Add one above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
