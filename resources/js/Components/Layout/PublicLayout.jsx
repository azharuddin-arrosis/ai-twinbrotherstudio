import { Link, usePage, useForm } from '@inertiajs/react';
import { Search, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

function SubscribeForm() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({ email: '', website: '' });

    if (flash.success && flash.success.includes('subscribed')) {
        return <p className="text-sm text-green-600 dark:text-green-400">{flash.success}</p>;
    }

    return (
        <form onSubmit={e => { e.preventDefault(); post('/subscribe', { onSuccess: () => reset() }); }}
              className="flex gap-2 flex-wrap">
            <input type="text" name="website" value={data.website}
                onChange={e => setData('website', e.target.value)}
                style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-indigo-500" />
            <button type="submit" disabled={processing}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                {processing ? '...' : 'Subscribe'}
            </button>
        </form>
    );
}

export default function PublicLayout({ children, dark = false }) {
    const { categories = [] } = usePage().props;
    const navLinks = categories.slice(0, 4).map(c => ({
        label: c.name,
        href: `/category/${c.slug}`,
    }));

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className={`min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-200 ${dark ? 'dark' : ''}`}>
            {/* Header */}
            <header className="border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white text-lg">
                            <Zap size={18} className="text-indigo-500" />
                            <span>Twin Brother Studio</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link href="/portfolio" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                Portfolio
                            </Link>
                            <Link href="/hire-us" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                Hire Us
                            </Link>
                        </nav>

                        {/* Search + Mobile toggle */}
                        <div className="flex items-center gap-3">
                            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
                                <div className="relative">
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 w-48 transition dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
                                    />
                                </div>
                            </form>

                            <button
                                className="md:hidden p-1.5 text-gray-500 dark:text-gray-400"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                {menuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
                        <form onSubmit={handleSearch} className="mb-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                        </form>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 text-sm text-gray-700 dark:text-gray-300"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/portfolio" className="block py-2 text-sm text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
                            Portfolio
                        </Link>
                        <Link href="/hire-us" className="block py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400" onClick={() => setMenuOpen(false)}>
                            Hire Us
                        </Link>
                    </div>
                )}
            </header>

            {/* Main */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-slate-800 mt-16">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <Zap size={14} className="text-indigo-500" />
                            <span className="font-medium text-gray-700 dark:text-white">Twin Brother Studio</span>
                            <span className="hidden sm:inline">— Build. Educate. Grow.</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                            <Link href="/portfolio" className="hover:text-gray-900 dark:hover:text-white transition-colors">Portfolio</Link>
                            <Link href="/hire-us" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">Hire Us</Link>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-slate-800 pt-6 mb-6 mt-6">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Get AI tutorials in your inbox</p>
                        <SubscribeForm />
                    </div>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} Twin Brother Studio. Content assisted by AI.
                    </p>
                </div>
            </footer>
        </div>
    );
}
