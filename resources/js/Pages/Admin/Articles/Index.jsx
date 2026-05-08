import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import DataTable from '../../../Components/Admin/DataTable';
import { Plus, Edit, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_BADGE = {
    ai_draft: 'bg-amber-50 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-blue-50 text-blue-700',
    published: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-500',
};

export default function ArticlesIndex({ articles, categories, filters }) {
    const handleFilter = (key, value) => {
        router.get('/admin/articles', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this article?')) {
            router.delete(`/admin/articles/${id}`, {
                onSuccess: () => toast.success('Article deleted.'),
                onError: () => toast.error('Failed to delete article.'),
            });
        }
    };

    const columns = [
        {
            accessorKey: 'title',
            header: 'Title',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="font-medium text-gray-900 line-clamp-1">{getValue()}</span>
            ),
        },
        {
            id: 'category',
            header: 'Category',
            enableSorting: true,
            cell: ({ row }) => (
                <span className="text-gray-500">{row.original.category?.name ?? '—'}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableSorting: true,
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status]}`}>
                        {status.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            accessorKey: 'published_at',
            header: 'Date',
            enableSorting: true,
            cell: ({ row }) => {
                const date = row.original.published_at ?? row.original.created_at;
                return (
                    <span className="text-gray-400 text-xs">
                        {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const article = row.original;
                return (
                    <div className="flex items-center gap-1.5 justify-end">
                        {article.status === 'ai_draft' && (
                            <>
                                <button
                                    onClick={() => router.post(`/admin/articles/${article.id}/publish`)}
                                    className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Publish"
                                >
                                    <CheckCircle size={14} />
                                </button>
                                <button
                                    onClick={() => router.post(`/admin/articles/${article.id}/reject`)}
                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                >
                                    <XCircle size={14} />
                                </button>
                            </>
                        )}
                        <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Edit size={14} />
                        </Link>
                        <button
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Articles">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    {/* Status filter */}
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                        <option value="">All status</option>
                        <option value="ai_draft">AI Draft</option>
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Category filter */}
                    <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilter('category', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search title..."
                        defaultValue={filters.search || ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFilter('search', e.target.value);
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-44"
                    />
                </div>

                <Link
                    href="/admin/articles/create"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={14} /> New Article
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={articles.data ?? []}
                searchPlaceholder="Search articles..."
                pageSize={articles.data?.length ?? 20}
                emptyText="No articles found."
            />

            {/* Server-side pagination */}
            {(articles.prev_page_url || articles.next_page_url) && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {articles.prev_page_url ? (
                        <Link
                            href={articles.prev_page_url}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <ChevronLeft size={14} /> Prev
                        </Link>
                    ) : null}
                    <span className="text-sm text-gray-500">
                        {articles.current_page} / {articles.last_page}
                    </span>
                    {articles.next_page_url ? (
                        <Link
                            href={articles.next_page_url}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            Next <ChevronRight size={14} />
                        </Link>
                    ) : null}
                </div>
            )}
        </AdminLayout>
    );
}
