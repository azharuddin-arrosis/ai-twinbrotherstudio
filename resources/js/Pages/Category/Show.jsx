import { Link } from '@inertiajs/react';
import PageMeta from '../../Components/UI/PageMeta';
import PublicLayout from '../../Components/Layout/PublicLayout';
import ArticleCard from '../../Components/UI/ArticleCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryShow({ category, articles }) {
    return (
        <PublicLayout>
            <PageMeta
                title={category.name}
                description={category.description || `Browse all ${category.name} articles on Prompt.`}
            />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Category Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
                    </div>
                    {category.description && (
                        <p className="text-sm text-gray-500 ml-5">{category.description}</p>
                    )}
                </div>

                {/* Articles Grid */}
                {articles.data?.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {articles.data.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {(articles.prev_page_url || articles.next_page_url) && (
                            <div className="flex items-center justify-center gap-2">
                                {articles.prev_page_url ? (
                                    <Link
                                        href={articles.prev_page_url}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft size={14} /> Previous
                                    </Link>
                                ) : (
                                    <span className="px-3 py-2 text-sm text-gray-300">
                                        <ChevronLeft size={14} />
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 px-2">
                                    Page {articles.current_page} of {articles.last_page}
                                </span>
                                {articles.next_page_url ? (
                                    <Link
                                        href={articles.next_page_url}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Next <ChevronRight size={14} />
                                    </Link>
                                ) : (
                                    <span className="px-3 py-2 text-sm text-gray-300">
                                        <ChevronRight size={14} />
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-base font-medium text-gray-600">No articles in this category yet.</p>
                        <Link href="/" className="text-sm text-indigo-500 hover:underline mt-2 inline-block">
                            ← Back to home
                        </Link>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
