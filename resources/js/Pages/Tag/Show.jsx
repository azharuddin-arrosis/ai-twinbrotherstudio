import { Link } from '@inertiajs/react';
import PageMeta from '../../Components/UI/PageMeta';
import PublicLayout from '../../Components/Layout/PublicLayout';
import ArticleCard from '../../Components/UI/ArticleCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TagShow({ tag, articles }) {
    return (
        <PublicLayout>
            <PageMeta
                title={`#${tag.name}`}
                description={`Browse all articles tagged with #${tag.name} on Prompt.`}
            />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Tag Header */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900">
                        <span className="text-indigo-400 font-normal">#</span>{tag.name}
                    </h1>
                    {articles.total != null && (
                        <p className="text-sm text-gray-500 mt-1">
                            {articles.total} {articles.total === 1 ? 'article' : 'articles'}
                        </p>
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
                        <p className="text-base font-medium text-gray-600">No articles found for this tag yet.</p>
                        <Link href="/" className="text-sm text-indigo-500 hover:underline mt-2 inline-block">
                            Back to home
                        </Link>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
