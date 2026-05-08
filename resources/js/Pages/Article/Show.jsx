import { Link, useForm, usePage } from '@inertiajs/react';
import PageMeta from '../../Components/UI/PageMeta';
import PublicLayout from '../../Components/Layout/PublicLayout';
import ArticleCard from '../../Components/UI/ArticleCard';
import { Clock, ExternalLink, Share2, Copy, Check, Eye, Heart, Send } from 'lucide-react';
import { useState } from 'react';

function formatRelativeTime(dateString) {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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

function CommentForm({ categorySlug, articleSlug }) {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', body: '', website: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/${categorySlug}/${articleSlug}/comments`, {
            onSuccess: () => reset('name', 'email', 'body'),
        });
    };

    if (flash.success && flash.success.includes('moderation')) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                {flash.success}
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            {/* Honeypot — hidden dari user */}
            <input type="text" name="website" value={data.website}
                onChange={e => setData('website', e.target.value)}
                style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <input type="text" placeholder="Your name *" value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.name ? 'border-red-300' : 'border-gray-200'}`} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <input type="email" placeholder="Your email * (not shown)" value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.email ? 'border-red-300' : 'border-gray-200'}`} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
            </div>
            <div>
                <textarea placeholder="Write your comment... *" value={data.body}
                    onChange={e => setData('body', e.target.value)} rows={4}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none ${errors.body ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
            </div>
            <button type="submit" disabled={processing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <Send size={13} />
                {processing ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
}

function CommentItem({ comment }) {
    return (
        <div className="py-4 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {comment.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-900">{comment.name}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed ml-9">{comment.body}</p>

            {/* Replies */}
            {comment.replies?.length > 0 && (
                <div className="ml-9 mt-3 space-y-3 pl-4 border-l-2 border-indigo-100">
                    {comment.replies.map(reply => (
                        <div key={reply.id}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                    T
                                </span>
                                <span className="text-xs font-semibold text-indigo-700">{reply.name}</span>
                                <span className="text-xs text-gray-400">· {formatRelativeTime(reply.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed ml-8">{reply.body}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
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
                type="article"
                url={`${window.location.origin}/${article.category.slug}/${article.slug}`}
                publishedAt={article.published_at}
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
                                    <Link key={tag.id} href={`/tag/${tag.slug}`}
                                        className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        #{tag.name}
                                    </Link>
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

                        {/* Comments */}
                        <section className="mt-10 pt-8 border-t border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900 mb-6">
                                {article.comments?.length > 0
                                    ? `${article.comments.length} Comment${article.comments.length > 1 ? 's' : ''}`
                                    : 'Comments'
                                }
                            </h2>

                            {article.comments?.length > 0 && (
                                <div className="mb-8 bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 px-4">
                                    {article.comments.map(comment => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))}
                                </div>
                            )}

                            <div className="bg-white border border-gray-100 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Leave a comment</h3>
                                <CommentForm categorySlug={article.category.slug} articleSlug={article.slug} />
                            </div>
                        </section>
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
