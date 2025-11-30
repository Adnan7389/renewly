import { ReactNode } from 'react';

/**
 * Props for the Modal component
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

/**
 * Reusable modal component
 * Displays a centered modal dialog with a title and close button
 */
function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--card)] rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-2xl"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
