import { router } from '@inertiajs/react';
import PublicLayout from '../Components/Layout/PublicLayout';
import ArticleCard from '../Components/UI/ArticleCard';
import PageMeta from '../Components/UI/PageMeta';
import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

export default function Search({ query, articles }) {
    const [q, setQ] = useState(query);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q }, { preserveState: true });
    };

    const hasResults = articles?.data?.length > 0;

    return (
        <PublicLayout>
            <PageMeta title={query ? `"${query}" — Search` : 'Search'} />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="max-w-xl mx-auto mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-sm"
                            autoFocus
                        />
                    </form>
                </div>

                {query && (
                    <p className="text-sm text-gray-500 mb-6 text-center">
                        {hasResults
                            ? `${articles.total} result${articles.total !== 1 ? 's' : ''} for "${query}"`
                            : `No results for "${query}"`}
                    </p>
                )}

                {hasResults ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.data.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-base font-medium text-gray-600">No articles found.</p>
                        <p className="text-sm mt-1">Try different keywords.</p>
                    </div>
                ) : null}
            </div>
        </PublicLayout>
    );
}
