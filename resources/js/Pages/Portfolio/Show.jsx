import { Link } from '@inertiajs/react';
import PublicLayout from '../../Components/Layout/PublicLayout';
import PageMeta from '../../Components/UI/PageMeta';
import { ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react';

function TechChip({ label }) {
    return (
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {label}
        </span>
    );
}

export default function PortfolioShow({ item }) {
    return (
        <PublicLayout>
            <PageMeta title={`${item.title} — Twin Brother Studio`} />

            <div className="max-w-3xl mx-auto px-4 py-12">

                {/* Back link */}
                <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
                >
                    <ArrowLeft size={14} /> Back to Portfolio
                </Link>

                {/* Hero image */}
                {item.image_path && (
                    <div className="mb-8 rounded-xl overflow-hidden max-h-96 bg-gray-100">
                        <img
                            src={`/storage/${item.image_path}`}
                            alt={item.title}
                            className="w-full h-full object-cover max-h-96"
                        />
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

                {/* Tech stack + live url row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 flex-1">
                            {item.tech_stack.map((t) => (
                                <TechChip key={t} label={t} />
                            ))}
                        </div>
                    )}
                    {item.live_url && (
                        <a
                            href={item.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors self-start sm:self-auto flex-shrink-0"
                        >
                            View Live Project <ExternalLink size={13} />
                        </a>
                    )}
                </div>

                <div className="border-t border-gray-100 mb-6" />

                {/* Short desc */}
                {item.short_desc && (
                    <p className="text-gray-500 text-base leading-relaxed mb-6">{item.short_desc}</p>
                )}

                {/* Long desc */}
                {item.long_desc && (
                    <div className="prose prose-gray max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-10">
                        {item.long_desc}
                    </div>
                )}

                {/* CTA box */}
                <div className="bg-indigo-50 rounded-xl px-6 py-6 text-center">
                    <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                        Interested in a similar project?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Let's talk about what we can build together.
                    </p>
                    <Link
                        href="/hire-us"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Get in Touch <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
