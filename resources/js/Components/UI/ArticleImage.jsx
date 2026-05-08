import { useState } from 'react';
import { ImageOff } from 'lucide-react';

const CATEGORY_COLORS = {
    'ai-tutorials': '#6366f1',
    'ai-tools-review': '#8b5cf6',
    'ai-for-work': '#0ea5e9',
    'ai-for-creativity': '#f59e0b',
    'ai-news': '#10b981',
    'ai-prompt-library': '#ef4444',
};

function Placeholder({ title, categorySlug, className }) {
    const color = CATEGORY_COLORS[categorySlug] || '#6b7280';
    const initials = (title || 'AI')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() || '')
        .join('');

    return (
        <div
            className={`flex flex-col items-center justify-center gap-2 ${className}`}
            style={{ backgroundColor: `${color}18` }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: color }}
            >
                {initials || <ImageOff size={16} />}
            </div>
            {title && (
                <p className="text-xs text-center px-3 line-clamp-2 font-medium" style={{ color }}>
                    {title}
                </p>
            )}
        </div>
    );
}

export default function ArticleImage({ src, alt, title, categorySlug, className = '' }) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return <Placeholder title={title} categorySlug={categorySlug} className={className} />;
    }

    return (
        <img
            src={src}
            alt={alt || title || ''}
            className={className}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}
