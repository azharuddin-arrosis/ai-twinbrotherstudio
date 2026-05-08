import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { ArrowLeft, Mail, Trash2 } from 'lucide-react';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month:   'long',
        day:     'numeric',
        year:    'numeric',
        hour:    '2-digit',
        minute:  '2-digit',
    });
}

function Field({ label, value }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    );
}

export default function ContactSubmissionShow({ submission }) {
    const handleDelete = () => {
        if (!confirm('Delete this submission?')) return;
        router.delete(`/admin/contact-submissions/${submission.id}`, {
            onSuccess: () => toast.success('Submission deleted.'),
            onError: () => toast.error('Failed to delete submission.'),
        });
    };

    return (
        <AdminLayout title="Submission Detail">
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/admin/contact-submissions"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Submissions
                </Link>

                <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={13} /> Delete
                </button>
            </div>

            <div className="max-w-2xl space-y-5">
                {/* Status + Date */}
                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        submission.is_read
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-red-50 text-red-600'
                    }`}>
                        {submission.is_read ? 'Read' : 'Unread'}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(submission.created_at)}</span>
                </div>

                {/* Contact details */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Name" value={submission.name} />
                        <Field label="Company" value={submission.company} />
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                            <a
                                href={`mailto:${submission.email}`}
                                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Mail size={12} /> {submission.email}
                            </a>
                        </div>
                        <Field label="Project Type" value={submission.project_type} />
                        <Field label="Budget Range" value={submission.budget_range} />
                    </div>
                </div>

                {/* Message */}
                <div className="bg-white border border-gray-100 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Message</h2>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                        {submission.message}
                    </p>
                </div>

                {/* Reply action */}
                <div className="flex justify-end">
                    <a
                        href={`mailto:${submission.email}?subject=Re: Project Inquiry from ${submission.name}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Mail size={13} /> Reply via Email
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
}
