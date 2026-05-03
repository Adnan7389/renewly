import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SubscriptionCard from '../components/SubscriptionCard.tsx';
import Modal from '../components/Modal.tsx';
import { api } from '../services/api';
import type { Subscription } from '../types';

/**
 * Delete modal state
 */
interface DeleteModalState {
    isOpen: boolean;
    subscriptionId: string | null;  // Prisma uses string IDs
}

/**
 * Dashboard page component
 * Displays subscription statistics and list of all subscriptions
 */
function Dashboard() {
    const queryClient = useQueryClient();
    
    const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
        isOpen: false,
        subscriptionId: null
    });

    const { data: subscriptions = [], isLoading: loading, isError } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: () => api.getSubscriptions(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteSubscription(id),
        onMutate: async (deletedId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['subscriptions'] });

            // Snapshot the previous subscriptions
            const previousSubscriptions = queryClient.getQueryData<Subscription[]>(['subscriptions']);

            // Optimistically update the cache
            if (previousSubscriptions) {
                queryClient.setQueryData<Subscription[]>(
                    ['subscriptions'],
                    previousSubscriptions.filter(sub => sub.id !== deletedId)
                );
            }

            // Close modal immediately for instant feedback
            setDeleteModal({ isOpen: false, subscriptionId: null });
            
            toast.success('Subscription deleted');

            return { previousSubscriptions };
        },
        onError: (_err, _deletedId, context) => {
            // Rollback on error
            if (context?.previousSubscriptions) {
                queryClient.setQueryData(['subscriptions'], context.previousSubscriptions);
            }
            toast.error('Failed to delete subscription');
        },
        onSettled: () => {
            // Sync with server and refresh analytics
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });

    const handleDeleteSubscription = (id: string): void => {
        deleteMutation.mutate(id);
    };

    const openDeleteModal = (id: string): void => {  // Changed to string
        setDeleteModal({ isOpen: true, subscriptionId: id });
    };

    const closeDeleteModal = (): void => {
        setDeleteModal({ isOpen: false, subscriptionId: null });
    };

    const getUpcomingSubscriptions = (): Subscription[] => {
        const today = new Date();
        return subscriptions.filter(sub => {
            const renewalDate = new Date(sub.nextRenewalDate);  // Correct field name
            const diffTime = renewalDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        });
    };

    const getTotalMonthlyCost = (): number => {
        return subscriptions.reduce((total, sub) => {
            let monthlyCost = sub.cost;  // Correct field name
            switch (sub.frequency) {     // Correct field name
                case 'WEEKLY':
                    monthlyCost = sub.cost * 4.33; // Average weeks per month
                    break;
                case 'QUARTERLY':
                    monthlyCost = sub.cost / 3;
                    break;
                case 'YEARLY':
                    monthlyCost = sub.cost / 12;
                    break;
                default: // MONTHLY
                    monthlyCost = sub.cost;
            }
            return total + monthlyCost;
        }, 0);
    };

    const upcomingSubscriptions = getUpcomingSubscriptions();
    const totalMonthlyCost = getTotalMonthlyCost();

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isError && (
                <div className="mb-6 bg-[var(--destructive)] border border-[var(--destructive)] text-[var(--destructive-foreground)] px-4 py-3 rounded-md">
                    Failed to fetch subscriptions.
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
                <p className="mt-2 text-[var(--muted-foreground)]">Manage your subscription renewals</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[var(--card)] p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <h3 className="text-lg font-medium text-[var(--foreground)]">Total Subscriptions</h3>
                    <p className="text-3xl font-bold text-[var(--primary)] mt-2">{subscriptions.length}</p>
                </div>

                <div className="bg-[var(--card)] p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <h3 className="text-lg font-medium text-[var(--foreground)]">Monthly Cost</h3>
                    <p className="text-3xl font-bold text-[var(--success)] mt-2">
                        ${totalMonthlyCost.toFixed(2)}
                    </p>
                </div>

                <div className="bg-[var(--card)] p-6 rounded-lg shadow-sm border border-[var(--border)]">
                    <h3 className="text-lg font-medium text-[var(--foreground)]">Upcoming Renewals</h3>
                    <p className="text-3xl font-bold text-[var(--warning)] mt-2">
                        {upcomingSubscriptions.length}
                    </p>
                </div>
            </div>

            {/* Upcoming Renewals Alert */}
            {upcomingSubscriptions.length > 0 && (
                <div className="mb-8 bg-[var(--warning)]/10 border-l-4 border-[var(--warning)] p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-[var(--warning)] text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-[var(--warning-foreground)]">
                                Upcoming Renewals
                            </h3>
                            <div className="mt-2 text-sm text-[var(--warning-foreground)] opacity-90">
                                <p>
                                    You have {upcomingSubscriptions.length} subscription{upcomingSubscriptions.length > 1 ? 's' : ''} renewing in the next 3 days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscriptions */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Your Subscriptions</h2>
                <Link
                    to="/add-subscription"
                    className="btn-primary"
                >
                    Add Subscription
                </Link>
            </div>

            {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No subscriptions yet</h3>
                    <p className="text-[var(--muted-foreground)] mb-6">Start tracking your subscriptions to get renewal reminders.</p>
                    <Link
                        to="/add-subscription"
                        className="btn-primary"
                    >
                        Add Your First Subscription
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map((subscription) => (
                        <SubscriptionCard
                            key={subscription.id}
                            subscription={subscription}
                            onDelete={openDeleteModal}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                title="Delete Subscription"
            >
                <p className="text-[var(--foreground)] mb-6">
                    Are you sure you want to delete this subscription? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={closeDeleteModal}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleDeleteSubscription(deleteModal.subscriptionId!)}
                        className="btn-destructive"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Dashboard;
