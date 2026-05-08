import { Link } from '@inertiajs/react';
import PageMeta from '../../Components/UI/PageMeta';
import PublicLayout from '../../Components/Layout/PublicLayout';
import ArticleCard from '../../Components/UI/ArticleCard';
import { Clock, ExternalLink, Share2, Copy, Check, Eye, Heart } from 'lucide-react';
import { useState } from 'react';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
}

function LikeButton({ article, categorySlug }) {
    const storageKey = `liked_article_${article.id}`;
    const [liked, setLiked] = useState(() => {
        try { return !!localStorage.getItem(storageKey); } catch { return false; }
    });
    const [count, setCount] = useState(article.like_count ?? 0);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (liked || loading) return;
        setLoading(true);
        setLiked(true);
        setCount(c => c + 1);  // optimistic

        try {
            const res = await fetch(`/${categorySlug}/${article.slug}/like`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            if (!res.ok || res.status === 409) {
                // revert optimistic jika 409
                setLiked(data.liked ?? false);
                setCount(data.like_count ?? count);
            } else {
                localStorage.setItem(storageKey, '1');
                setCount(data.like_count);
            }
        } catch {
            setLiked(false);
            setCount(c => Math.max(0, c - 1));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 flex items-center gap-3">
            <button
                onClick={handleLike}
                disabled={liked || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    liked
                        ? 'bg-red-50 border-red-200 text-red-500 cursor-default'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                }`}
            >
                <Heart size={15} className={liked ? 'fill-red-400 text-red-400' : ''} />
                {liked ? 'Liked' : 'Like this article'}
                {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${liked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                        {formatCount(count)}
                    </span>
                )}
            </button>
        </div>
    );
}

export default function ArticleShow({ article, related }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <PublicLayout>
            <PageMeta
                title={article.meta_title || article.title}
                description={article.meta_description}
                image={article.featured_image}
            />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">

                    {/* Article */}
                    <article>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                            <Link href="/" className="hover:text-gray-700">Home</Link>
                            <span>/</span>
                            <Link href={`/category/${article.category.slug}`} className="hover:text-gray-700">
                                {article.category.name}
                            </Link>
                        </div>

                        {/* Header */}
                        <header className="mb-6">
                            <Link
                                href={`/category/${article.category.slug}`}
                                className="inline-block text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2"
                            >
                                {article.category.name}
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                {article.title}
                            </h1>
                            {article.excerpt && (
                                <p className="mt-3 text-base text-gray-600 leading-relaxed">
                                    {article.excerpt}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={13} />
                                    {article.reading_time} min read
                                </span>
                                {article.published_at && (
                                    <span>{formatDate(article.published_at)}</span>
                                )}
                                {article.view_count > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={13} />
                                        {formatCount(article.view_count)}
                                    </span>
                                )}
                                {article.source_name && (
                                    <span className="flex items-center gap-1">
                                        Via {article.source_name}
                                        {article.source_url && (
                                            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink size={11} />
                                            </a>
                                        )}
                                    </span>
                                )}
                            </div>
                        </header>

                        {/* Featured Image */}
                        {article.featured_image && (
                            <div className="mb-6 rounded-xl overflow-hidden aspect-[16/9] bg-gray-100">
                                <img
                                    src={article.featured_image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-gray prose-sm sm:prose max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Tags */}
                        {article.tags?.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Like */}
                        <LikeButton
                            article={article}
                            categorySlug={article.category.slug}
                        />

                        {/* Share */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <span className="text-sm text-gray-500 flex items-center gap-1.5">
                                <Share2 size={14} /> Share
                            </span>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                X / Twitter
                            </a>
                            <button
                                onClick={handleCopy}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy link</>}
                            </button>
                        </div>

                        {/* AI Disclosure */}
                        {article.source_type === 'ai_generated' && (
                            <p className="mt-6 text-xs text-gray-400 border-t border-gray-100 pt-4">
                                This article was written with AI assistance.
                                {article.source_url && (
                                    <> Original source: <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="underline">{article.source_name || article.source_url}</a>.</>
                                )}
                            </p>
                        )}
                    </article>

                    {/* Sidebar */}
                    <aside className="hidden lg:block">
                        {related.length > 0 && (
                            <div className="sticky top-20">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    Related Articles
                                </h3>
                                <div className="space-y-5">
                                    {related.map((article) => (
                                        <ArticleCard key={article.id} article={article} size="compact" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </PublicLayout>
    );
}
