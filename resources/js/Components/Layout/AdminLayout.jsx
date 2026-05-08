import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, FileText, Tag, FolderOpen, Rss,
    LogOut, Zap, ChevronRight, Menu, X,
    Briefcase, Mail, Inbox
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

const NAV = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Tags', href: '/admin/tags', icon: Tag },
    { label: 'RSS Sources', href: '/admin/rss-sources', icon: Rss },
    { label: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
    { label: 'Contact Settings', href: '/admin/contact-settings', icon: Mail },
    { label: 'Submissions', href: '/admin/contact-submissions', icon: Inbox },
];

export default function AdminLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, props } = usePage();
    const { flash = {} } = props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const isActive = (href) => {
        if (href === '/admin') return url === '/admin';
        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col
                transform transition-transform duration-200
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0
            `}>
                <div className="h-14 flex items-center px-4 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <Zap size={16} className="text-indigo-500" />
                        <span>TBS</span>
                    </Link>
                    <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">Admin</span>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {NAV.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`
                                flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                ${isActive(href)
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-1.5 text-gray-500"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={18} />
                    </button>
                    <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>

            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}
