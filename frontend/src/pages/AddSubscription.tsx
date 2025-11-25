import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { SubscriptionFrequency } from '../types';

/**
 * Form data structure for add/edit subscription
 * Uses string for cost to handle input field state
 */
interface SubscriptionFormData {
    name: string;
    cost: string;  // String in form, converted to number on submit
    renewalDate: string;  // ISO date string (YYYY-MM-DD)
    frequency: SubscriptionFrequency;
    description: string;
}

/**
 * AddSubscription page component
 * Handles both creating new subscriptions and editing existing ones
 */
function AddSubscription() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<SubscriptionFormData>({
        name: '',
        cost: '',
        renewalDate: '',
        frequency: 'MONTHLY',
        description: '',
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isEditing) {
            fetchSubscription();
        }
    }, [id, isEditing]);

    const fetchSubscription = async (): Promise<void> => {
        try {
            const subscriptions = await api.getSubscriptions();
            const subscription = subscriptions.find(sub => sub.id === id);  // id is already a string

            if (subscription) {
                setFormData({
                    name: subscription.name,
                    cost: subscription.cost.toString(),                    // Correct: cost
                    renewalDate: new Date(subscription.renewalDate).toISOString().split('T')[0],  // Correct: renewalDate
                    frequency: subscription.frequency,                     // Correct: frequency
                    description: subscription.description || '',           // Correct: description
                });
            } else {
                setError('Subscription not found');
            }
        } catch (error) {
            setError('Failed to fetch subscription');
            console.error('Fetch subscription error:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // EXPLANATION: The backend controller expects the OLD field names:
            // - cost (not price)
            // - renewalDate (not nextBillingDate)  
            // - frequency (not billingCycle)
            // This is because the backend controller hasn't been updated to use
            // the new Prisma schema field names yet.

            const subscriptionData = {
                name: formData.name,
                cost: parseFloat(formData.cost),           // Backend expects 'cost'
                renewalDate: formData.renewalDate,         // Backend expects 'renewalDate'
                frequency: formData.frequency,             // Backend expects 'frequency'
                description: formData.description,
            };

            if (isEditing) {
                await api.updateSubscription(Number(id), subscriptionData);
            } else {
                await api.createSubscription(subscriptionData);
            }

            navigate('/dashboard');
        } catch (error: any) {
            setError(error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} subscription`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {isEditing ? 'Update your subscription details' : 'Track a new subscription renewal'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="input-field"
                                placeholder="Netflix, Spotify, etc."
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                                Cost ($) *
                            </label>
                            <input
                                type="number"
                                id="cost"
                                name="cost"
                                required
                                min="0"
                                step="0.01"
                                className="input-field"
                                placeholder="15.99"
                                value={formData.cost}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Next Renewal Date *
                            </label>
                            <input
                                type="date"
                                id="renewalDate"
                                name="renewalDate"
                                required
                                className="input-field"
                                value={formData.renewalDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                                Billing Frequency *
                            </label>
                            <select
                                id="frequency"
                                name="frequency"
                                required
                                className="input-field"
                                value={formData.frequency}
                                onChange={handleChange}
                            >
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="input-field"
                            placeholder="Additional notes about this subscription..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ?
                                (isEditing ? 'Updating...' : 'Adding...') :
                                (isEditing ? 'Update Subscription' : 'Add Subscription')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSubscription;
