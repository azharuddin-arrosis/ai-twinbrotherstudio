import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../Components/Layout/AdminLayout';
import { FileText, CheckCircle, Clock, FolderOpen } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <div className={`p-1.5 rounded-lg ${color}`}>
                    <Icon size={14} className="text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function Dashboard({ stats, pendingArticles }) {
    const handlePublish = (id) => {
        router.post(`/admin/articles/${id}/publish`);
    };

    const handleReject = (id) => {
        router.post(`/admin/articles/${id}/reject`);
    };

    return (
        <AdminLayout title="Dashboard">
            

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Articles" value={stats.total_articles} icon={FileText} color="bg-blue-500" />
                <StatCard label="Published" value={stats.published} icon={CheckCircle} color="bg-green-500" />
                <StatCard label="Pending Review" value={stats.pending_review} icon={Clock} color="bg-amber-500" />
                <StatCard label="Categories" value={stats.total_categories} icon={FolderOpen} color="bg-indigo-500" />
            </div>

            {/* Pending Articles */}
            <div className="bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Pending AI Drafts</h2>
                    <Link href="/admin/articles?status=ai_draft" className="text-xs text-indigo-600 hover:underline">
                        See all
                    </Link>
                </div>

                {pendingArticles.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">
                        No pending articles. All caught up!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {pendingArticles.map((article) => (
                            <div key={article.id} className="flex items-center gap-4 px-5 py-3">
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/admin/articles/${article.id}/edit`}
                                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
                                    >
                                        {article.title}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-400">{article.category?.name}</span>
                                        {article.source_name && (
                                            <span className="text-xs text-gray-300">· via {article.source_name}</span>
                                        )}
                                        <span className="text-xs text-gray-300">· {formatDate(article.created_at)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href={`/admin/articles/${article.id}/edit`}
                                        className="text-xs px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Review
                                    </Link>
                                    <button
                                        onClick={() => handlePublish(article.id)}
                                        className="text-xs px-2.5 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Publish
                                    </button>
                                    <button
                                        onClick={() => handleReject(article.id)}
                                        className="text-xs px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
