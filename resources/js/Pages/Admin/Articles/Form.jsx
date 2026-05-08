import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import RichEditor from '../../../Components/UI/RichEditor';
import { Save, Eye, ArrowLeft, ChevronDown, Zap, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useValidation from '../../../hooks/useValidation';

const schema = {
    title:   { required: true, minLength: 3, maxLength: 255 },
    content: { required: true, minLength: 10 },
};

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function ArticleForm({ article, categories, tags }) {
    const isEdit = !!article;
    const [seoOpen, setSeoOpen] = useState(false);
    const [humanityChecking, setHumanityChecking] = useState(false);
    const [humanityResult, setHumanityResult] = useState(
        article?.humanity_score != null
            ? { score: article.humanity_score, category: article.humanity_score >= 80 ? 'human' : article.humanity_score >= 50 ? 'mixed' : 'ai' }
            : null
    );
    const [humanityOpen, setHumanityOpen] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        title: article?.title || '',
        category_id: article?.category_id || '',
        excerpt: article?.excerpt || '',
        content: article?.content || '',
        featured_image: article?.featured_image || '',
        meta_title: article?.meta_title || '',
        meta_description: article?.meta_description || '',
        status: article?.status || 'draft',
        tags: article?.tags?.map(t => t.id) || [],
        published_at: article?.published_at?.slice(0, 16) || '',
    });

    const { clientErrors, validate, touchAll } = useValidation(schema, data);

    const submit = (e) => {
        e.preventDefault();
        if (!touchAll(data)) return;
        const options = {
            onSuccess: () => toast.success('Article saved successfully!'),
            onError: () => toast.error('Please fix the errors and try again.'),
        };
        if (isEdit) {
            put(`/admin/articles/${article.id}`, options);
        } else {
            post('/admin/articles', options);
        }
    };

    const runHumanityCheck = async () => {
        setHumanityChecking(true);
        setHumanityOpen(true);
        setHumanityResult(null);
        try {
            const res = await fetch(`/admin/articles/${article.id}/check-humanity`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            setHumanityResult(data);
        } catch {
            setHumanityResult({ error: 'Network error. Try again.' });
        } finally {
            setHumanityChecking(false);
        }
    };

    const toggleTag = (id) => {
        const current = data.tags;
        setData('tags', current.includes(id) ? current.filter(t => t !== id) : [...current, id]);
    };

    const metaTitleCount = data.meta_title.length;
    const metaDescCount = data.meta_description.length;

    const titleError = clientErrors.title || errors.title;
    const contentError = clientErrors.content || errors.content;

    return (
        <AdminLayout title={isEdit ? 'Edit Article' : 'New Article'}>

            <form onSubmit={submit}>
                <div className="flex items-center justify-between mb-5">
                    <Link href="/admin/articles" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                        <ArrowLeft size={14} /> Back
                    </Link>
                    <div className="flex items-center gap-2">
                        {isEdit && article.status === 'published' && (
                            <a
                                href={`/${article.category?.slug}/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <Eye size={13} /> View
                            </a>
                        )}
                        {isEdit && (
                            <button
                                type="button"
                                onClick={runHumanityCheck}
                                disabled={humanityChecking}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <Zap size={13} className="text-amber-500" />
                                {humanityChecking ? 'Checking...' : 'Check Humanity'}
                                {humanityResult && !humanityResult.error && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ml-0.5 ${
                                        humanityResult.score >= 80
                                            ? 'bg-green-100 text-green-700'
                                            : humanityResult.score >= 50
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {humanityResult.score}%
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={13} />
                            {processing ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

                    {/* Main content */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
                            <Field label="Title" error={titleError}>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => { setData('title', e.target.value); validate('title', e.target.value); }}
                                    onBlur={e => validate('title', e.target.value, true)}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${titleError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:ring-indigo-300'}`}
                                    placeholder="Article title..."
                                />
                            </Field>

                            <Field label="Excerpt" error={errors.excerpt} hint="Short description shown in article cards. Leave blank to auto-generate from content.">
                                <textarea
                                    value={data.excerpt}
                                    onChange={e => setData('excerpt', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                    placeholder="Brief summary of the article..."
                                />
                            </Field>

                            <Field label="Content" error={contentError}>
                                <RichEditor
                                    value={data.content}
                                    onChange={val => setData('content', val)}
                                />
                            </Field>
                        </div>

                        {/* SEO Section — collapsible */}
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setSeoOpen(!seoOpen)}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                SEO Settings
                                <ChevronDown size={14} className={`transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {seoOpen && (
                                <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
                                    <Field
                                        label={`Meta Title (${metaTitleCount}/60)`}
                                        error={errors.meta_title}
                                        hint="Leave blank to use article title."
                                    >
                                        <input
                                            type="text"
                                            value={data.meta_title}
                                            onChange={e => setData('meta_title', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                            placeholder="SEO title..."
                                            maxLength={60}
                                        />
                                        <div className="h-1 mt-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${metaTitleCount > 55 ? 'bg-red-400' : metaTitleCount > 40 ? 'bg-amber-400' : 'bg-green-400'}`}
                                                style={{ width: `${Math.min(100, (metaTitleCount / 60) * 100)}%` }}
                                            />
                                        </div>
                                    </Field>

                                    <Field
                                        label={`Meta Description (${metaDescCount}/160)`}
                                        error={errors.meta_description}
                                    >
                                        <textarea
                                            value={data.meta_description}
                                            onChange={e => setData('meta_description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                            placeholder="SEO description..."
                                            maxLength={160}
                                        />
                                        <div className="h-1 mt-1 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${metaDescCount > 150 ? 'bg-red-400' : metaDescCount > 120 ? 'bg-amber-400' : 'bg-green-400'}`}
                                                style={{ width: `${Math.min(100, (metaDescCount / 160) * 100)}%` }}
                                            />
                                        </div>
                                    </Field>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">

                        {/* Publish settings */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Publish</h3>

                            <Field label="Status" error={errors.status}>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="review">Review</option>
                                    <option value="published">Published</option>
                                    {isEdit && <option value="ai_draft">AI Draft</option>}
                                    {isEdit && <option value="rejected">Rejected</option>}
                                </select>
                            </Field>

                            {data.status === 'published' && (
                                <Field label="Publish Date" error={errors.published_at}>
                                    <input
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={e => setData('published_at', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </Field>
                            )}
                        </div>

                        {/* Category */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</h3>
                            <Field error={errors.category_id}>
                                <select
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                                >
                                    <option value="">Select category...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Tags */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                            data.tags.includes(tag.id)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                                {tags.length === 0 && (
                                    <p className="text-xs text-gray-400">No tags yet. Create some in Tags menu.</p>
                                )}
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured Image</h3>
                            <Field error={errors.featured_image}>
                                <input
                                    type="url"
                                    value={data.featured_image}
                                    onChange={e => setData('featured_image', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    placeholder="https://..."
                                />
                            </Field>
                            {data.featured_image && (
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <img src={data.featured_image} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </form>

            {humanityOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-amber-500" />
                                <h3 className="font-semibold text-gray-900 text-sm">Humanity Score</h3>
                            </div>
                            <button type="button" onClick={() => setHumanityOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={16} />
                            </button>
                        </div>

                        {humanityChecking && (
                            <div className="text-center py-8 text-sm text-gray-400">
                                Analyzing article content...
                            </div>
                        )}

                        {!humanityChecking && humanityResult && humanityResult.error && (
                            <div className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">
                                {humanityResult.error}
                            </div>
                        )}

                        {!humanityChecking && humanityResult && !humanityResult.error && (
                            <div className="space-y-4">
                                {/* Score ring */}
                                <div className="text-center py-4">
                                    <div className={`text-5xl font-bold mb-1 ${
                                        humanityResult.score >= 80
                                            ? 'text-green-600'
                                            : humanityResult.score >= 50
                                            ? 'text-amber-500'
                                            : 'text-red-500'
                                    }`}>
                                        {humanityResult.score}
                                    </div>
                                    <div className="text-xs text-gray-400 mb-2">out of 100</div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                        humanityResult.category === 'human'
                                            ? 'bg-green-100 text-green-700'
                                            : humanityResult.category === 'mixed'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {humanityResult.category === 'human' ? 'Sounds Human' : humanityResult.category === 'mixed' ? 'Mixed Signals' : 'AI-like Writing'}
                                    </span>
                                </div>

                                {/* Score bar */}
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            humanityResult.score >= 80 ? 'bg-green-500' : humanityResult.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                        }`}
                                        style={{ width: `${humanityResult.score}%` }}
                                    />
                                </div>

                                {/* Issues */}
                                {humanityResult.issues?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Issues Found</h4>
                                        <ul className="space-y-1.5">
                                            {humanityResult.issues.map((issue, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                    <span className="text-red-400 mt-0.5 flex-shrink-0">×</span>
                                                    {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {humanityResult.suggestions?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggestions</h4>
                                        <ul className="space-y-1.5">
                                            {humanityResult.suggestions.map((s, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5 flex-shrink-0">→</span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
