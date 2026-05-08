import { Link, useForm, usePage } from '@inertiajs/react';
import PageMeta from '../Components/UI/PageMeta';
import PublicLayout from '../Components/Layout/PublicLayout';
import ArticleCard from '../Components/UI/ArticleCard';
import { ArrowRight } from 'lucide-react';

function SubscribeInline() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, reset } = useForm({ email: '', website: '' });

    if (flash.success && flash.success.includes('subscribed')) {
        return <p className="text-sm text-indigo-200">{flash.success}</p>;
    }

    return (
        <form onSubmit={e => { e.preventDefault(); post('/subscribe', { onSuccess: () => reset() }); }}
              className="flex gap-2 max-w-sm mx-auto">
            <input type="text" name="website" value={data.website}
                onChange={e => setData('website', e.target.value)}
                style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-white/10 border border-white/30 text-white placeholder-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm" />
            <button type="submit" disabled={processing}
                className="px-4 py-2.5 text-sm bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 disabled:opacity-60 transition-colors whitespace-nowrap">
                {processing ? '...' : 'Subscribe'}
            </button>
        </form>
    );
}

export default function Home({ featured, categories, latestByCategory, featuredPortfolio = [] }) {
    const hero = featured[0];
    const heroSide = featured.slice(1, 5);

    return (
        <PublicLayout>
            <PageMeta title="Learn AI — Tutorials, Tools & Tips" noSuffix />

            {/* Section 1: Dark Hero */}
            {hero && (
                <section className="bg-slate-900 py-12">
                    <div className="px-4 sm:px-6 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main hero */}
                            <div className="lg:col-span-2">
                                <ArticleCard article={hero} size="default" />
                            </div>

                            {/* Side articles */}
                            <div className="space-y-5 border-l border-slate-700 pl-6 hidden lg:block">
                                {heroSide.map((article) => (
                                    <ArticleCard key={article.id} article={article} size="compact" />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Section 2: Featured Work */}
            {featuredPortfolio.length > 0 && (
                <section className="bg-gray-50 py-12">
                    <div className="px-4 sm:px-6 lg:px-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-gray-900 text-lg">Our Work</h2>
                            <Link
                                href="/portfolio"
                                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                View all <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredPortfolio.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/portfolio/${item.slug}`}
                                    className="group block hover:opacity-90 transition-opacity"
                                >
                                    {item.image_path ? (
                                        <img
                                            src={'/storage/' + item.image_path}
                                            alt={item.title}
                                            className="aspect-video object-cover rounded-lg bg-gray-100 w-full"
                                        />
                                    ) : (
                                        <div className="aspect-video bg-gray-100 rounded-lg" />
                                    )}
                                    <p className="font-semibold text-gray-900 text-sm mt-3">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.short_desc}</p>
                                    {item.tech_stack && item.tech_stack.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tech_stack.slice(0, 3).map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Section 3: Category sections */}
            {categories.map((category, idx) => {
                const articles = latestByCategory[category.slug];
                if (!articles || articles.length === 0) return null;

                return (
                    <section key={category.id} className={`py-12 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                        <div className="px-4 sm:px-6 lg:px-12">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <h2 className="font-semibold text-gray-900">{category.name}</h2>
                                    <span className="text-xs text-gray-400">
                                        {category.articles_count} articles
                                    </span>
                                </div>
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    See all <ArrowRight size={13} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* Newsletter CTA */}
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-14">
                <div className="px-4 sm:px-6 lg:px-12 max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Stay ahead with AI tutorials</h2>
                    <p className="text-indigo-200 text-sm mb-6">Weekly tips, tools, and tutorials delivered to your inbox.</p>
                    <SubscribeInline />
                </div>
            </section>

            {/* Empty state */}
            {categories.every(c => !latestByCategory[c.slug]?.length) && (
                <div className="py-20 px-4 text-center text-gray-400">
                    <p className="text-lg font-medium text-gray-600">No articles yet.</p>
                    <p className="text-sm mt-1">Check back soon — content is being generated.</p>
                </div>
            )}
        </PublicLayout>
    );
}
