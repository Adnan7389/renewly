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
                return 'bg-[var(--success)] text-[var(--success-foreground)]';
            case 'MONTHLY':
                return 'bg-[var(--secondary)] text-[var(--secondary-foreground)]';
            case 'QUARTERLY':
                return 'bg-[var(--warning)] text-[var(--warning-foreground)]';
            case 'YEARLY':
                return 'bg-[var(--primary)] text-[var(--primary-foreground)]';
            default:
                return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
        }
    };

    const getCategoryStyle = (color: string | null) => {
        if (!color) return { backgroundColor: '#E5E7EB', color: '#374151' };
        return {
            backgroundColor: `${color}20`, // 20% opacity
            color: color,
            borderColor: `${color}40`
        };
    };

    // Use the correct Prisma field names
    const renewalDate = subscription.renewalDate;
    const cost = subscription.cost;
    const frequency = subscription.frequency;

    const daysUntilRenewal = getDaysUntilRenewal(renewalDate);
    const isUpcoming = daysUntilRenewal <= 3 && daysUntilRenewal >= 0;
    const isOverdue = daysUntilRenewal < 0;

    return (
        <div className={`bg-[var(--card)] rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md ${isUpcoming ? 'border-[var(--warning)] bg-[var(--warning)]/10' :
            isOverdue ? 'border-[var(--destructive)] bg-[var(--destructive)]/10' :
                'border-[var(--border)]'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">{subscription.name}</h3>
                        {subscription.category && (
                            <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium border"
                                style={getCategoryStyle(subscription.category.color)}
                            >
                                {subscription.category.name}
                            </span>
                        )}
                    </div>
                    {subscription.description && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">{subscription.description}</p>
                    )}
                    {subscription.tags && subscription.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {subscription.tags.map(tag => (
                                <span key={tag.id} className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Link
                        to={`/edit-subscription/${subscription.id}`}
                        className="text-[var(--primary)] hover:brightness-90 text-sm font-medium"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => onDelete(subscription.id)}
                        className="text-[var(--destructive)] hover:brightness-90 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold text-[var(--foreground)]">
                    ${cost.toFixed(2)}
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">
                        /{formatFrequency(frequency)}
                    </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(frequency)}`}>
                    {formatFrequency(frequency)}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Next renewal</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                        {new Date(renewalDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-[var(--muted-foreground)]">Days until renewal</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-[var(--destructive)]' :
                        isUpcoming ? 'text-[var(--warning-foreground)]' :
                            'text-[var(--foreground)]'
                        }`}>
                        {isOverdue ? `${Math.abs(daysUntilRenewal)} days overdue` :
                            daysUntilRenewal === 0 ? 'Today' :
                                daysUntilRenewal === 1 ? 'Tomorrow' :
                                    `${daysUntilRenewal} days`}
                    </p>
                </div>
            </div>

            {isUpcoming && (
                <div className="mt-4 p-3 bg-[var(--warning)]/10 border border-[var(--warning)] rounded-md">
                    <p className="text-sm text-[var(--warning-foreground)]">
                        ⚠️ This subscription is renewing soon!
                    </p>
                </div>
            )}

            {isOverdue && (
                <div className="mt-4 p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)] rounded-md">
                    <p className="text-sm text-[var(--destructive-foreground)]">
                        🚨 This subscription renewal date has passed!
                    </p>
                </div>
            )}
        </div>
    );
}

export default SubscriptionCard;
