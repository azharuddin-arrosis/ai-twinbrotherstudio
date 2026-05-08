import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import DataTable from '../../../Components/Admin/DataTable';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

function StatusBadge({ isRead }) {
    if (isRead) {
        return (
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                Read
            </span>
        );
    }
    return (
        <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
            Unread
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

export default function ContactSubmissionsIndex({ submissions, unreadCount }) {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const markAsRead = (e, id) => {
        e.stopPropagation();
        router.patch(`/admin/contact-submissions/${id}/mark-read`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success('Marked as read.'),
        });
    };

    const columns = [
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            cell: ({ row }) => (
                <span className={`font-medium ${!row.original.read_at ? 'text-gray-900' : 'text-gray-700'}`}>
                    {row.original.name}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="text-gray-500 text-xs">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'project_type',
            header: 'Project',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="text-gray-500 text-xs">{getValue() || '—'}</span>
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
            accessorKey: 'is_read',
            header: 'Status',
            enableSorting: true,
            cell: ({ row }) => (
                <StatusBadge isRead={!!row.original.read_at} />
            ),
        },
        {
            id: 'expand',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const submission = row.original;
                return (
                    <button
                        onClick={() => toggleExpand(submission.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={expandedId === submission.id ? 'Collapse row' : 'Expand row'}
                    >
                        {expandedId === submission.id
                            ? <ChevronUp size={14} />
                            : <ChevronDown size={14} />
                        }
                    </button>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Submissions">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-6">
                <h2 className="text-base font-semibold text-gray-900">Contact Submissions</h2>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-medium">
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {/* DataTable — server-side paginated, disable client repagination */}
            <DataTable
                columns={columns}
                data={submissions.data ?? []}
                searchPlaceholder="Search submissions..."
                pageSize={submissions.data?.length ?? 20}
                emptyText="No submissions yet."
                rowClassName={(row) =>
                    !row.original.read_at ? 'bg-red-50/20 cursor-pointer' : 'cursor-pointer'
                }
                onRowClick={(row) => toggleExpand(row.original.id)}
                renderSubRow={(row) => {
                    const submission = row.original;
                    if (expandedId !== submission.id) return null;
                    return (
                        <tr key={`${submission.id}-detail`}>
                            <td colSpan={7} className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-0.5">Company</p>
                                        <p className="text-gray-800">{submission.company || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-0.5">Budget Range</p>
                                        <p className="text-gray-800">{submission.budget_range || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                                        <a
                                            href={`mailto:${submission.email}`}
                                            className="text-indigo-600 hover:text-indigo-700"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {submission.email}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Message</p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-white border border-gray-100 rounded-lg px-4 py-3 leading-relaxed">
                                        {submission.message}
                                    </p>
                                </div>
                                {!submission.read_at && (
                                    <button
                                        onClick={(e) => markAsRead(e, submission.id)}
                                        className="mt-3 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                }}
            />

            {/* Server-side pagination */}
            {(submissions.prev_page_url || submissions.next_page_url) && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {submissions.prev_page_url ? (
                        <Link
                            href={submissions.prev_page_url}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft size={14} /> Prev
                        </Link>
                    ) : null}
                    <span className="text-sm text-gray-500">
                        {submissions.current_page} / {submissions.last_page}
                    </span>
                    {submissions.next_page_url ? (
                        <Link
                            href={submissions.next_page_url}
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
