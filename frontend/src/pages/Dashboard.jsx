import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SubscriptionCard from '../components/SubscriptionCard';
import Modal from '../components/Modal';
import { api } from '../services/api';

function Dashboard() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, subscriptionId: null });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const data = await api.getSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            setError('Failed to fetch subscriptions');
            console.error('Fetch subscriptions error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubscription = async (id) => {
        try {
            await api.deleteSubscription(id);
            setSubscriptions(prev => prev.filter(sub => sub.id !== id));
            setDeleteModal({ isOpen: false, subscriptionId: null });
        } catch (error) {
            setError('Failed to delete subscription');
            console.error('Delete subscription error:', error);
        }
    };

    const openDeleteModal = (id) => {
        setDeleteModal({ isOpen: true, subscriptionId: id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, subscriptionId: null });
    };

    const getUpcomingSubscriptions = () => {
        const today = new Date();
        return subscriptions.filter(sub => {
            const renewalDate = new Date(sub.renewalDate);
            const diffTime = renewalDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        });
    };

    const getTotalMonthlyCost = () => {
        return subscriptions.reduce((total, sub) => {
            let monthlyCost = sub.cost;
            switch (sub.frequency) {
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
                <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your subscription renewals</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Total Subscriptions</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{subscriptions.length}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Monthly Cost</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        ${totalMonthlyCost.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Upcoming Renewals</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {upcomingSubscriptions.length}
                    </p>
                </div>
            </div>

            {/* Upcoming Renewals Alert */}
            {upcomingSubscriptions.length > 0 && (
                <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-400 text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Upcoming Renewals
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    You have {upcomingSubscriptions.length} subscription{upcomingSubscriptions.length > 1 ? 's' : ''}
                                    renewing in the next 3 days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscriptions */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Subscriptions</h2>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
                    <p className="text-gray-600 mb-6">Start tracking your subscriptions to get renewal reminders.</p>
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
                <p className="text-gray-700 mb-6">
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
                        onClick={() => handleDeleteSubscription(deleteModal.subscriptionId)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Dashboard;