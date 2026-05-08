import { useForm, usePage } from '@inertiajs/react';
import PublicLayout from '../../Components/Layout/PublicLayout';
import PageMeta from '../../Components/UI/PageMeta';
import { Mail, MessageCircle, Briefcase, Camera, AtSign, GitBranch, Send } from 'lucide-react';

const INPUT_CLASS = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition';

const PROJECT_TYPES = [
    'Web Application',
    'Mobile App',
    'API / Backend',
    'UI/UX Design',
    'Consultation',
    'Other',
];

const BUDGET_RANGES = [
    'Under $1,000',
    '$1,000 – $5,000',
    '$5,000 – $10,000',
    '$10,000+',
    'Prefer not to say',
];

const CONTACT_MAP = {
    admin_email: {
        icon: Mail,
        label: 'Email',
        href: (v) => `mailto:${v}`,
        display: (v) => v,
    },
    whatsapp_number: {
        icon: MessageCircle,
        label: 'WhatsApp',
        href: (v) => `https://wa.me/${v.replace(/\D/g, '')}`,
        display: (v) => v,
    },
    linkedin_url: {
        icon: Briefcase,
        label: 'LinkedIn',
        href: (v) => v,
        display: (v) => v.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, ''),
    },
    instagram_url: {
        icon: Camera,
        label: 'Instagram',
        href: (v) => v,
        display: (v) => v.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, ''),
    },
    twitter_url: {
        icon: AtSign,
        label: 'Twitter / X',
        href: (v) => v,
        display: (v) => v.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@').replace(/\/$/, ''),
    },
    github_url: {
        icon: GitBranch,
        label: 'GitHub',
        href: (v) => v,
        display: (v) => v.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, ''),
    },
};

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function HireUs({ contactSettings }) {
    const { flash = {} } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        company: '',
        project_type: '',
        budget_range: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/hire-us/submit');
    };

    const contactEntries = Object.entries(CONTACT_MAP).filter(
        ([key]) => contactSettings[key] && contactSettings[key].toString().trim() !== ''
    );

    return (
        <PublicLayout>
            <PageMeta title="Hire Us — Twin Brother Studio" />

            <div className="max-w-6xl mx-auto px-4 py-12">

                {/* Hero */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        Let's Build Something Together
                    </h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto">
                        Tell us about your project and we'll get back to you within 24 hours. We specialize in web applications, APIs, and custom software solutions.
                    </p>
                </div>

                {/* Flash success */}
                {flash.success && (
                    <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Left: Form */}
                    <div className="bg-white border border-gray-100 rounded-xl p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-5">Send us a message</h2>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className={INPUT_CLASS}
                                />
                                <FieldError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className={INPUT_CLASS}
                                />
                                <FieldError message={errors.email} />
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    placeholder="Your company (optional)"
                                    className={INPUT_CLASS}
                                />
                                <FieldError message={errors.company} />
                            </div>

                            {/* Project Type */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Project Type
                                </label>
                                <select
                                    value={data.project_type}
                                    onChange={(e) => setData('project_type', e.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    <option value="">Select a project type...</option>
                                    {PROJECT_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <FieldError message={errors.project_type} />
                            </div>

                            {/* Budget Range */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Budget Range
                                </label>
                                <select
                                    value={data.budget_range}
                                    onChange={(e) => setData('budget_range', e.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    <option value="">Select a budget range...</option>
                                    {BUDGET_RANGES.map((range) => (
                                        <option key={range} value={range}>{range}</option>
                                    ))}
                                </select>
                                <FieldError message={errors.budget_range} />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Message <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={5}
                                    placeholder="Tell us about your project, goals, timeline, or anything else we should know..."
                                    required
                                    className={`${INPUT_CLASS} resize-none`}
                                />
                                <FieldError message={errors.message} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={14} />
                                {processing ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Contact Info */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 mb-2">Get in touch</h2>
                            <p className="text-sm text-gray-500">
                                Prefer reaching out directly? Use any of the channels below.
                            </p>
                        </div>

                        {contactEntries.length > 0 ? (
                            <div className="space-y-3">
                                {contactEntries.map(([key, meta]) => {
                                    const value = contactSettings[key];
                                    const Icon = meta.icon;
                                    return (
                                        <a
                                            key={key}
                                            href={meta.href(value)}
                                            target={key !== 'admin_email' ? '_blank' : undefined}
                                            rel={key !== 'admin_email' ? 'noopener noreferrer' : undefined}
                                            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                                        >
                                            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                                <Icon size={16} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-500">{meta.label}</p>
                                                <p className="text-sm text-gray-800 truncate">{meta.display(value)}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No contact information available yet.</p>
                        )}

                        <div className="bg-indigo-50 rounded-xl px-4 py-4 text-sm text-indigo-700">
                            <p className="font-medium mb-0.5">Response time</p>
                            <p className="text-indigo-600 text-xs">We typically respond within 24 hours on business days.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
