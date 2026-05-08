import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Eye, TrendingUp, BarChart2, Heart } from 'lucide-react';

function formatCount(n) {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <div className={`p-1.5 rounded-lg ${color}`}>
                    <Icon size={14} className="text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCount(value)}</p>
        </div>
    );
}

function ViewsChart({ data }) {
    const max = Math.max(...data.map(d => d.views), 1);
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Views — Last 30 Days</h3>
            <div className="flex items-end gap-0.5 h-28">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center" title={`${d.date}: ${d.views} views`}>
                        <div
                            className="w-full bg-indigo-500 rounded-t-sm transition-all"
                            style={{ height: `${Math.max((d.views / max) * 100, d.views > 0 ? 4 : 0)}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">{data[0]?.date?.slice(5)}</span>
                <span className="text-xs text-gray-400">{data[data.length - 1]?.date?.slice(5)}</span>
            </div>
        </div>
    );
}

function TopArticlesTable({ articles, showWeekViews = false }) {
    return (
        <div className="divide-y divide-gray-50">
            {articles.map((item, index) => {
                const article = showWeekViews ? item.article : item;
                const views = showWeekViews ? item.total : item.view_count;
                const href = `/${article?.category?.slug}/${article?.slug}`;

                return (
                    <div key={showWeekViews ? item.article_id : item.id} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-xs font-bold text-gray-300 w-6 text-center flex-shrink-0">
                            #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
                            >
                                {article?.title}
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                            <span className="flex items-center gap-1">
                                <Eye size={11} /> {formatCount(views)}
                            </span>
                            {!showWeekViews && (
                                <span className="flex items-center gap-1">
                                    <Heart size={11} /> {formatCount(item.like_count)}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function AnalyticsIndex({ chartData = [], topAllTime = [], topThisWeek = [], stats = {} }) {
    return (
        <AdminLayout title="Analytics">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Views Today" value={stats.views_today} icon={Eye} color="bg-indigo-500" />
                <StatCard label="Views (7 days)" value={stats.views_7d} icon={TrendingUp} color="bg-blue-500" />
                <StatCard label="Views (30 days)" value={stats.views_30d} icon={BarChart2} color="bg-purple-500" />
                <StatCard label="All-Time Views + Likes" value={stats.views_all_time} icon={Heart} color="bg-rose-500" />
            </div>

            {/* Chart */}
            {chartData.length > 0 && <ViewsChart data={chartData} />}

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Articles All Time */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Top Articles (All Time)</h3>
                    </div>
                    {topAllTime.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">No data yet.</div>
                    ) : (
                        <TopArticlesTable articles={topAllTime} showWeekViews={false} />
                    )}
                </div>

                {/* Top This Week */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Top This Week</h3>
                    </div>
                    {topThisWeek.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">No data yet.</div>
                    ) : (
                        <TopArticlesTable articles={topThisWeek} showWeekViews={true} />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
