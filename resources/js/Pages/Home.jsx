import { Link } from '@inertiajs/react';
import PageMeta from '../Components/UI/PageMeta';
import PublicLayout from '../Components/Layout/PublicLayout';
import ArticleCard from '../Components/UI/ArticleCard';
import { ArrowRight } from 'lucide-react';

export default function Home({ featured, categories, latestByCategory, featuredPortfolio = [] }) {
    const hero = featured[0];
    const heroSide = featured.slice(1, 5);

    return (
        <PublicLayout>
            <PageMeta title="Learn AI — Tutorials, Tools & Tips" noSuffix />

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Hero Section */}
                {hero && (
                    <section className="mb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main hero */}
                            <div className="lg:col-span-2">
                                <ArticleCard article={hero} size="default" />
                            </div>

                            {/* Side articles */}
                            <div className="space-y-5 border-l border-gray-100 pl-6 hidden lg:block">
                                {heroSide.map((article) => (
                                    <ArticleCard key={article.id} article={article} size="compact" />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Featured Work Section */}
                {featuredPortfolio.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-gray-900">Our Work</h2>
                            <Link
                                href="/portfolio"
                                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                View all projects <ArrowRight size={13} />
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
                    </section>
                )}

                <div className="border-t border-gray-100 mb-10" />

                {/* Category sections */}
                {categories.map((category) => {
                    const articles = latestByCategory[category.slug];
                    if (!articles || articles.length === 0) return null;

                    return (
                        <section key={category.id} className="mb-12">
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
                        </section>
                    );
                })}

                {/* Empty state */}
                {categories.every(c => !latestByCategory[c.slug]?.length) && (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-lg font-medium text-gray-600">No articles yet.</p>
                        <p className="text-sm mt-1">Check back soon — content is being generated.</p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
