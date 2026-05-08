import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import DataTable from '../../../Components/Admin/DataTable';
import { Plus, Edit, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2, ScrollText, X } from 'lucide-react';

const STATUS_BADGE = {
    ai_draft:         'bg-amber-50 text-amber-700',
    ai_needs_review:  'bg-orange-50 text-orange-700',
    draft:            'bg-gray-100 text-gray-600',
    review:           'bg-blue-50 text-blue-700',
    published:        'bg-green-50 text-green-700',
    rejected:         'bg-red-50 text-red-500',
};

function HumanityCell({ score, attempts }) {
    // Belum dicek sama sekali
    if (score === null || score === undefined) {
        return (
            <span className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 size={11} className="animate-spin" /> Checking...
            </span>
        );
    }

    const color = score >= 70
        ? 'bg-green-50 text-green-700'
        : score >= 50
        ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-500';

    const isImproving = score < 70 && attempts < 5;

    return (
        <div className="flex items-center gap-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                {score}%
            </span>
            {isImproving && (
                <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Loader2 size={10} className="animate-spin" />
                    <span>{attempts}/5</span>
                </span>
            )}
            {!isImproving && attempts > 0 && score < 70 && (
                <span className="text-xs text-red-400">{attempts}/5</span>
            )}
        </div>
    );
}

const EVENT_STYLE = {
    GENERATED: 'bg-blue-50 text-blue-700',
    HUMANITY:  'bg-amber-50 text-amber-700',
    REWRITE:   'bg-purple-50 text-purple-700',
    PASSED:    'bg-green-50 text-green-700',
    EXHAUSTED: 'bg-red-50 text-red-500',
    TRANSLATE: 'bg-teal-50 text-teal-700',
};

function LogModal({ article, onClose }) {
    const [lines, setLines] = useState(null);

    useState(() => {
        fetch(`/admin/articles/${article.id}/log`)
            .then(r => r.json())
            .then(d => setLines(d.lines));
    }, [article.id]);

    const parseEvent = (line) => {
        const match = line.match(/\[(.+?)\]\s+(\w+)\s*(.*)/);
        if (!match) return { time: '', event: 'INFO', rest: line };
        const ctx = match[3].split(' | ').filter(Boolean).map(s => {
            const [k, ...v] = s.split(': ');
            return { key: k?.trim(), val: v.join(': ').trim() };
        });
        return { time: match[1], event: match[2].trim(), ctx };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{article.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Activity Log</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <X size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-5 py-4">
                    {lines === null ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
                            <Loader2 size={16} className="animate-spin" /> Loading...
                        </div>
                    ) : lines.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No log yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {lines.map((line, i) => {
                                const { time, event, ctx } = parseEvent(line);
                                const style = EVENT_STYLE[event] ?? 'bg-gray-50 text-gray-600';
                                return (
                                    <div key={i} className="flex gap-3 text-xs">
                                        <span className="text-gray-300 shrink-0 pt-0.5 w-36">{time}</span>
                                        <span className={`px-2 py-0.5 rounded font-mono font-medium shrink-0 h-fit ${style}`}>{event}</span>
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-gray-500">
                                            {ctx?.map(({ key, val }, j) => (
                                                <span key={j}><span className="text-gray-400">{key}:</span> {val}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ArticlesIndex({ articles, categories, filters }) {
    const [logArticle, setLogArticle] = useState(null);

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
            accessorKey: 'humanity_score',
            header: 'Humanity',
            enableSorting: true,
            cell: ({ row }) => (
                <HumanityCell
                    score={row.original.humanity_score}
                    attempts={row.original.humanity_attempts ?? 0}
                />
            ),
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
                        <button
                            onClick={() => setLogArticle(article)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Activity Log"
                        >
                            <ScrollText size={14} />
                        </button>
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
                        <option value="ai_needs_review">Needs Review</option>
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
            {logArticle && <LogModal article={logArticle} onClose={() => setLogArticle(null)} />}
        </AdminLayout>
    );
}
