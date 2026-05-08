import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

// Track setiap navigasi Inertia ke GA4
// Diperlukan karena SPA tidak reload halaman — GA4 tidak bisa detect sendiri
router.on('navigate', (event) => {
    if (typeof window.gtag === 'undefined') return;
    gtag('event', 'page_view', {
        page_path: event.detail.page.url,
        page_title: document.title,
    });
});

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <HelmetProvider>
                <App {...props} />
            </HelmetProvider>
        );
    },
    progress: {
        color: '#6366f1',
    },
});
