import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import ExportButtons from '../components/ExportButtons';
import type { Subscription } from '../types';

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
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const [prefs, subs] = await Promise.all([
                api.getPreferences(),
                api.getSubscriptions()
            ]);
            setReminderDays(prefs.reminderDays);
            setSubscriptions(subs);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updatePreferences(reminderDays);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to update preferences:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-[var(--foreground)] sm:text-3xl sm:truncate">
                        Settings
                    </h2>
                </div>
            </div>

            <div className="bg-[var(--card)] shadow overflow-hidden sm:rounded-lg max-w-2xl border border-[var(--border)]">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-[var(--foreground)]">
                        Notification Preferences
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
                        Customize when you receive subscription renewal reminders.
                    </p>
                </div>
                <div className="border-t border-[var(--border)] px-4 py-5 sm:p-6">


                    <div className="space-y-4">
                        <label className="text-base font-medium text-[var(--foreground)]">
                            When should we remind you?
                        </label>
                        <p className="text-sm text-[var(--muted-foreground)]">
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
                                        className="focus:ring-[var(--ring)] h-4 w-4 text-[var(--primary)] border-[var(--input)] bg-[var(--background)]"
                                    />
                                    <label
                                        htmlFor={`reminder-${option.value}`}
                                        className="ml-3 block text-sm font-medium text-[var(--foreground)]"
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
                            className={`btn-primary ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-[var(--card)] shadow overflow-hidden sm:rounded-lg max-w-2xl border border-[var(--border)]">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-[var(--foreground)]">
                        Data Management
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
                        Download your subscription data for offline access or backup.
                    </p>
                </div>
                <div className="border-t border-[var(--border)] px-4 py-5 sm:p-6">
                    <ExportButtons subscriptions={subscriptions} />
                </div>
            </div>
        </div>
    );
}

export default Settings;
