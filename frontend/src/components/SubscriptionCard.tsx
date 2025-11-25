import { Link } from 'react-router-dom';
import type { Subscription } from '../types';

/**
 * Props for the SubscriptionCard component
 */
interface SubscriptionCardProps {
    subscription: Subscription;
    onDelete: (id: string) => void;  // Changed to string
}

/**
 * Subscription card component
 * Displays subscription details with edit/delete actions and renewal warnings
 */
function SubscriptionCard({ subscription, onDelete }: SubscriptionCardProps) {
    const getDaysUntilRenewal = (renewalDate: string): number => {
        const today = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = renewal.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatFrequency = (frequency: string): string => {
        return frequency.toLowerCase().replace('ly', '');
    };

    const getFrequencyColor = (frequency: string): string => {
        switch (frequency) {
            case 'WEEKLY':
                return 'bg-green-100 text-green-800';
            case 'MONTHLY':
                return 'bg-blue-100 text-blue-800';
            case 'QUARTERLY':
                return 'bg-yellow-100 text-yellow-800';
            case 'YEARLY':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Use the correct Prisma field names
    const renewalDate = subscription.renewalDate;
    const cost = subscription.cost;
    const frequency = subscription.frequency;

    const daysUntilRenewal = getDaysUntilRenewal(renewalDate);
    const isUpcoming = daysUntilRenewal <= 3 && daysUntilRenewal >= 0;
    const isOverdue = daysUntilRenewal < 0;

    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md ${isUpcoming ? 'border-yellow-300 bg-yellow-50' :
            isOverdue ? 'border-red-300 bg-red-50' :
                'border-gray-200'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
                    {subscription.description && (
                        <p className="text-sm text-gray-600 mt-1">{subscription.description}</p>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Link
                        to={`/edit-subscription/${subscription.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => onDelete(subscription.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold text-gray-900">
                    ${cost.toFixed(2)}
                    <span className="text-sm font-normal text-gray-500">
                        /{formatFrequency(frequency)}
                    </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(frequency)}`}>
                    {formatFrequency(frequency)}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-600">Next renewal</p>
                    <p className="text-sm font-medium text-gray-900">
                        {new Date(renewalDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Days until renewal</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' :
                        isUpcoming ? 'text-yellow-600' :
                            'text-gray-900'
                        }`}>
                        {isOverdue ? `${Math.abs(daysUntilRenewal)} days overdue` :
                            daysUntilRenewal === 0 ? 'Today' :
                                daysUntilRenewal === 1 ? 'Tomorrow' :
                                    `${daysUntilRenewal} days`}
                    </p>
                </div>
            </div>

            {isUpcoming && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                    <p className="text-sm text-yellow-800">
                        ⚠️ This subscription is renewing soon!
                    </p>
                </div>
            )}

            {isOverdue && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-sm text-red-800">
                        🚨 This subscription renewal date has passed!
                    </p>
                </div>
            )}
        </div>
    );
}

export default SubscriptionCard;
