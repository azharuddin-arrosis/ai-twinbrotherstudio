import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'AITutorials';
const DEFAULT_DESC = 'Learn how to use AI tools effectively — tutorials, tips, and reviews for everyday users.';

export default function PageMeta({ title, description, image, noSuffix = false }) {
    const fullTitle = noSuffix ? title : (title ? `${title} — ${SITE_NAME}` : SITE_NAME);
    const desc = description || DEFAULT_DESC;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            <meta property="og:site_name" content={SITE_NAME} />
            {image && <meta property="og:image" content={image} />}
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={desc} />
        </Helmet>
    );
}
