import { Link } from '@inertiajs/react';
import PublicLayout from '../../Components/Layout/PublicLayout';
import PageMeta from '../../Components/UI/PageMeta';
import { ExternalLink, ArrowRight } from 'lucide-react';

function TechChip({ label }) {
    return (
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {label}
        </span>
    );
}

function PortfolioCard({ item }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group flex flex-col">
            {/* Image */}
            <Link href={`/portfolio/${item.slug}`} className="block aspect-video overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image_path ? (
                    <img
                        src={`/storage/${item.image_path}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No image</span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/portfolio/${item.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.title}
                    </h3>
                </Link>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                    {item.short_desc}
                </p>

                {/* Tech stack */}
                {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tech_stack.slice(0, 4).map((t) => (
                            <TechChip key={t} label={t} />
                        ))}
                        {item.tech_stack.length > 4 && (
                            <span className="text-xs text-gray-400 px-1 py-0.5">
                                +{item.tech_stack.length - 4}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                    <Link
                        href={`/portfolio/${item.slug}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        View details <ArrowRight size={11} />
                    </Link>
                    {item.live_url && (
                        <a
                            href={item.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                        >
                            Live <ExternalLink size={11} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PortfolioIndex({ items }) {
    return (
        <PublicLayout>
            <PageMeta title="Portfolio — Prompt" />

            <div className="max-w-6xl mx-auto px-4 py-12">

                {/* Hero */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Our Work</h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto">
                        A selection of projects we've built — from web applications and APIs to custom software solutions.
                    </p>
                </div>

                {/* Grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {items.map((item) => (
                            <PortfolioCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center text-gray-400">
                        No projects yet. Check back soon!
                    </div>
                )}

                {/* CTA */}
                <div className="border-t border-gray-100 pt-12 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Interested in working with us?
                    </h2>
                    <p className="text-sm text-gray-500 mb-5">
                        We'd love to hear about your project and see how we can help.
                    </p>
                    <Link
                        href="/hire-us"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Hire Us <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
