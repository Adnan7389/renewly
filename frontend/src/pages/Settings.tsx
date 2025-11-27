import { useState, useEffect } from 'react';
import { api } from '../services/api';

const REMINDER_OPTIONS = [
    { value: 1, label: '1 day before' },
    { value: 3, label: '3 days before' },
    { value: 7, label: '7 days before' },
    { value: 14, label: '14 days before' },
];

function Settings() {
    const [reminderDays, setReminderDays] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const prefs = await api.getPreferences();
            setReminderDays(prefs.reminderDays);
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.updatePreferences(reminderDays);
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
            console.error('Failed to update preferences:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Settings
                    </h2>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Notification Preferences
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Customize when you receive subscription renewal reminders.
                    </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    {message && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-base font-medium text-gray-900">
                            When should we remind you?
                        </label>
                        <p className="text-sm text-gray-500">
                            Select how many days in advance you want to be notified before a subscription renews.
                        </p>

                        <div className="mt-4 space-y-4">
                            {REMINDER_OPTIONS.map((option) => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        id={`reminder-${option.value}`}
                                        name="notification-method"
                                        type="radio"
                                        checked={reminderDays === option.value}
                                        onChange={() => setReminderDays(option.value)}
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                                    />
                                    <label
                                        htmlFor={`reminder-${option.value}`}
                                        className="ml-3 block text-sm font-medium text-gray-700"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${saving ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
