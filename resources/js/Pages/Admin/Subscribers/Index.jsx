import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Download } from 'lucide-react';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

function StatusBadge({ status }) {
    if (status === 'active') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            unsubscribed
        </span>
    );
}

export default function SubscribersIndex({ subscribers, activeCount, totalCount }) {
    const handleDelete = (id) => {
        if (!confirm('Delete this subscriber? This action cannot be undone.')) return;
        router.delete(`/admin/subscribers/${id}`);
    };

    return (
        <AdminLayout title="Subscribers">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-gray-900">Newsletter Subscribers</h2>
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {activeCount} active
                    </span>
                    {totalCount != null && (
                        <span className="text-xs text-gray-400">/ {totalCount} total</span>
                    )}
                </div>
                <a
                    href="/admin/subscribers/export"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Download size={13} />
                    Export CSV
                </a>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                {subscribers.data?.length === 0 ? (
                    <div className="py-16 text-center text-sm text-gray-400">
                        No subscribers yet.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Name
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Email
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Status
                                        </th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Subscribed
                                        </th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {subscribers.data.map((subscriber) => (
                                        <tr key={subscriber.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3 text-gray-700">
                                                {subscriber.name || <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-3 text-gray-700 font-mono text-xs">
                                                {subscriber.email}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={subscriber.status} />
                                            </td>
                                            <td className="px-5 py-3 text-gray-400 text-xs">
                                                {formatDate(subscriber.created_at)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(subscriber.id)}
                                                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {(subscribers.prev_page_url || subscribers.next_page_url) && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                    Page {subscribers.current_page} of {subscribers.last_page}
                                </span>
                                <div className="flex items-center gap-2">
                                    {subscribers.prev_page_url ? (
                                        <Link
                                            href={subscribers.prev_page_url}
                                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Previous
                                        </Link>
                                    ) : null}
                                    {subscribers.next_page_url ? (
                                        <Link
                                            href={subscribers.next_page_url}
                                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Next
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
