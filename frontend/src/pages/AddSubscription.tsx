import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { SubscriptionFrequency, Category, Tag } from '../types';

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
    categoryId: string;
    tags: string[]; // Array of tag IDs
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
        categoryId: '',
        tags: [],
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchCategoriesAndTags();
        if (isEditing) {
            fetchSubscription();
        }
    }, [id, isEditing]);

    const fetchCategoriesAndTags = async () => {
        try {
            const [categoriesData, tagsData] = await Promise.all([
                api.getCategories(),
                api.getTags()
            ]);
            setCategories(categoriesData);
            setTags(tagsData);
        } catch (error) {
            console.error('Failed to fetch categories or tags', error);
        }
    };

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
                    categoryId: subscription.categoryId || '',
                    tags: subscription.tags ? subscription.tags.map(t => t.id) : [],
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

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const newCategory = await api.createCategory({ name: newCategoryName });
            setCategories([...categories, newCategory]);
            setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (error) {
            console.error('Failed to create category', error);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const newTag = await api.createTag({ name: newTagName.startsWith('#') ? newTagName : `#${newTagName}` });
            setTags([...tags, newTag]);
            if (!formData.tags.includes(newTag.id)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.id] }));
            }
            setNewTagName('');
        } catch (error) {
            console.error('Failed to create tag', error);
        }
    };

    const toggleTag = (tagId: string) => {
        setFormData(prev => {
            const newTags = prev.tags.includes(tagId)
                ? prev.tags.filter(id => id !== tagId)
                : [...prev.tags, tagId];
            return { ...prev, tags: newTags };
        });
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
                categoryId: formData.categoryId || null,
                tags: formData.tags,
            };

            if (isEditing) {
                await api.updateSubscription(id!, subscriptionData);
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
            <div className="bg-[var(--card)] shadow-sm rounded-lg border border-[var(--border)]">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">
                        {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
                    </h1>
                    <p className="mt-2 text-[var(--muted-foreground)]">
                        {isEditing ? 'Update your subscription details' : 'Track a new subscription renewal'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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
                            <label htmlFor="cost" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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
                            <label htmlFor="renewalDate" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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
                            <label htmlFor="frequency" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Category
                            </label>
                            {!showNewCategoryInput ? (
                                <div className="flex space-x-2">
                                    <select
                                        id="category"
                                        name="categoryId"
                                        className="input-field flex-grow"
                                        value={formData.categoryId}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                setShowNewCategoryInput(true);
                                            } else {
                                                setFormData(prev => ({ ...prev, categoryId: e.target.value }));
                                            }
                                        }}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                        <option value="new">+ Create New Category</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        className="input-field flex-grow"
                                        placeholder="Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateCategory}
                                        className="btn-primary"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryInput(false)}
                                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Tags
                            </label>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.tags.includes(tag.id)
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 border'
                                                : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] border hover:bg-[var(--muted)]/80'
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        className="input-field flex-grow text-sm"
                                        placeholder="Add new tag (e.g. #monthly)"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCreateTag();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateTag}
                                        className="btn-secondary text-sm py-1 px-3"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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

                    <div className="flex justify-end space-x-3 pt-6 border-t border-[var(--border)]">
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
