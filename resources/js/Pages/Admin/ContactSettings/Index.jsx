import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Save } from 'lucide-react';

export default function ContactSettingsIndex({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        settings: settings.map((s) => ({
            key: s.key,
            value: s.value ?? '',
        })),
    });

    const updateValue = (index, value) => {
        const updated = [...data.settings];
        updated[index] = { ...updated[index], value };
        setData('settings', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/contact-settings/bulk-update', {
            onSuccess: () => toast.success('Settings saved.'),
            onError: () => toast.error('Failed to save settings.'),
        });
    };

    return (
        <AdminLayout title="Contact Settings">
            <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900">Contact Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Configure contact information displayed on the Hire Us page.
                </p>
            </div>

            <form onSubmit={submit}>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                    {settings.map((setting, index) => (
                        <div key={setting.id} className="flex items-center gap-4 px-5 py-4">
                            <label
                                htmlFor={`setting-${setting.key}`}
                                className="w-40 flex-shrink-0 text-sm font-medium text-gray-700"
                            >
                                {setting.label}
                            </label>
                            <div className="flex-1">
                                <input
                                    id={`setting-${setting.key}`}
                                    type="text"
                                    value={data.settings[index]?.value ?? ''}
                                    onChange={(e) => updateValue(index, e.target.value)}
                                    placeholder={`Enter ${setting.label.toLowerCase()}...`}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                />
                                {errors[`settings.${index}.value`] && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors[`settings.${index}.value`]}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {settings.length === 0 && (
                        <div className="py-10 text-center text-sm text-gray-400">
                            No settings available.
                        </div>
                    )}
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={14} />
                        {processing ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
