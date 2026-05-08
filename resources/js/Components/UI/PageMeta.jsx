import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Prompt';
const DEFAULT_DESC = 'Prompt — AI tutorials, tools, and tips for everyday users.';

export default function PageMeta({ title, description, image, noSuffix = false, type = 'website', url, publishedAt }) {
    const fullTitle = noSuffix ? title : (title ? `${title} — ${SITE_NAME}` : SITE_NAME);
    const desc = description || DEFAULT_DESC;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content={type} />
            {url && <meta property="og:url" content={url} />}
            {image && <meta property="og:image" content={image} />}
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={desc} />
            <meta name="twitter:site" content="@twinbrotherstudio" />
            {type === 'article' && (
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": fullTitle,
                    "description": desc,
                    "image": image || '',
                    "datePublished": publishedAt || '',
                    "publisher": {
                        "@type": "Organization",
                        "name": "Prompt",
                        "url": "https://prompt.twinbrotherstudio.com"
                    }
                })}</script>
            )}
        </Helmet>
    );
}
