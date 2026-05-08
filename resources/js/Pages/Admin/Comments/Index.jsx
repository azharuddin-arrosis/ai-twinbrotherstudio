import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import DataTable from '../../../Components/Admin/DataTable';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, XCircle, Trash2, Reply } from 'lucide-react';

const STATUS_TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

function StatusBadge({ status }) {
    const map = {
        pending: 'bg-amber-50 text-amber-600',
        approved: 'bg-green-50 text-green-600',
        rejected: 'bg-red-50 text-red-600',
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function CommentsIndex({ comments, pendingCount, filters }) {
    const [expandedId, setExpandedId] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});

    const activeStatus = filters?.status ?? '';

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleFilter = (status) => {
        router.get('/admin/comments', status ? { status } : {}, { preserveState: true });
    };

    const approve = (e, id) => {
        e.stopPropagation();
        router.post(`/admin/comments/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Comment approved.'),
        });
    };

    const reject = (e, id) => {
        e.stopPropagation();
        router.post(`/admin/comments/${id}/reject`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Comment rejected.'),
        });
    };

    const destroy = (e, id) => {
        e.stopPropagation();
        if (confirm('Delete this comment?')) {
            router.delete(`/admin/comments/${id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Comment deleted.'),
            });
        }
    };

    const submitReply = (e, commentId) => {
        e.preventDefault();
        router.post(`/admin/comments/${commentId}/reply`,
            { body: replyTexts[commentId] ?? '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
                    toast.success('Reply posted.');
                },
            }
        );
    };

    const columns = [
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="font-medium text-gray-900">{getValue()}</span>
            ),
        },
        {
            id: 'article_title',
            header: 'Article',
            enableSorting: false,
            cell: ({ row }) => {
                const comment = row.original;
                if (!comment.article) return <span className="text-gray-400 text-xs">—</span>;
                return (
                    <Link
                        href={`/${comment.article.category_slug}/${comment.article.slug}`}
                        className="text-indigo-600 hover:text-indigo-700 text-xs"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {comment.article.title}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'body',
            header: 'Preview',
            enableSorting: false,
            cell: ({ getValue }) => (
                <span className="line-clamp-1 text-gray-500 text-xs max-w-xs">
                    {getValue()?.slice(0, 50)}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="text-gray-400 text-xs">{formatDate(getValue())}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableSorting: true,
            cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        },
        {
            id: 'expand',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const comment = row.original;
                return (
                    <button
                        onClick={() => toggleExpand(comment.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={expandedId === comment.id ? 'Collapse row' : 'Expand row'}
                    >
                        {expandedId === comment.id
                            ? <ChevronUp size={14} />
                            : <ChevronDown size={14} />
                        }
                    </button>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Comments">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <h2 className="text-base font-semibold text-gray-900">Comments</h2>
                {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-medium">
                        {pendingCount} pending
                    </span>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 mb-5">
                {STATUS_TABS.map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => handleFilter(value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            activeStatus === value
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={comments.data ?? []}
                searchPlaceholder="Search comments..."
                pageSize={comments.data?.length ?? 20}
                emptyText="No comments yet."
                rowClassName={() => 'cursor-pointer'}
                onRowClick={(row) => toggleExpand(row.original.id)}
                renderSubRow={(row) => {
                    const comment = row.original;
                    if (expandedId !== comment.id) return null;
                    const canReply = comment.status === 'approved';
                    return (
                        <tr key={`${comment.id}-detail`}>
                            <td colSpan={7} className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                                {/* Full body */}
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Comment</p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-white border border-gray-100 rounded-lg px-4 py-3 leading-relaxed">
                                        {comment.body}
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 mb-4">
                                    {comment.status !== 'approved' && (
                                        <button
                                            onClick={(e) => approve(e, comment.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle size={13} />
                                            Approve
                                        </button>
                                    )}
                                    {comment.status !== 'rejected' && (
                                        <button
                                            onClick={(e) => reject(e, comment.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={13} />
                                            Reject
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => destroy(e, comment.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Trash2 size={13} />
                                        Delete
                                    </button>
                                </div>

                                {/* Existing replies */}
                                {comment.replies?.length > 0 && (
                                    <div className="mb-4 pl-4 border-l-2 border-indigo-100 space-y-3">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id}>
                                                <p className="text-xs font-semibold text-indigo-700 mb-0.5">{reply.name}</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply form — only for approved comments */}
                                {canReply && (
                                    <form
                                        onSubmit={(e) => submitReply(e, comment.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-2"
                                    >
                                        <p className="text-xs font-medium text-gray-500 mb-1.5">Reply as admin</p>
                                        <textarea
                                            value={replyTexts[comment.id] ?? ''}
                                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                            rows={3}
                                            placeholder="Write a reply..."
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!(replyTexts[comment.id] ?? '').trim()}
                                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Reply size={13} />
                                            Post Reply
                                        </button>
                                    </form>
                                )}
                            </td>
                        </tr>
                    );
                }}
            />

            {/* Server-side pagination */}
            {(comments.prev_page_url || comments.next_page_url) && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {comments.prev_page_url ? (
                        <Link
                            href={comments.prev_page_url}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft size={14} /> Prev
                        </Link>
                    ) : null}
                    <span className="text-sm text-gray-500">
                        {comments.current_page} / {comments.last_page}
                    </span>
                    {comments.next_page_url ? (
                        <Link
                            href={comments.next_page_url}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Next <ChevronRight size={14} />
                        </Link>
                    ) : null}
                </div>
            )}
        </AdminLayout>
    );
}
