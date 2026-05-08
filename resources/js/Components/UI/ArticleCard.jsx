import { Link } from '@inertiajs/react';
import { Clock, Eye } from 'lucide-react';
import ArticleImage from './ArticleImage';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
}

export default function ArticleCard({ article, size = 'default' }) {
    const href = `/${article.category?.slug}/${article.slug}`;
    const categorySlug = article.category?.slug;

    if (size === 'compact') {
        return (
            <Link href={href} className="flex gap-3 group">
                <div className="w-16 h-16 rounded-md flex-shrink-0 overflow-hidden">
                    <ArticleImage
                        src={article.featured_image}
                        title={article.title}
                        categorySlug={categorySlug}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={11} />
                        {article.reading_time} min
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <Link href={href} className="group block">
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-3">
                <ArticleImage
                    src={article.featured_image}
                    title={article.title}
                    categorySlug={categorySlug}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div>
                {article.category && (
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                        {article.category.name}
                    </span>
                )}
                <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                </h3>
                {article.excerpt && (
                    <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                    </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {article.reading_time} min read
                    </span>
                    {article.published_at && (
                        <span>{formatDate(article.published_at)}</span>
                    )}
                    {article.view_count > 0 && (
                        <span className="flex items-center gap-1">
                            <Eye size={11} />
                            {formatCount(article.view_count)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
