import React from 'react';

interface ToastErrorProps {
    message: string;
    onClose?: () => void;
    duration?: number;
}

export const ToastError: React.FC<ToastErrorProps> = ({
    message,
    onClose,
    duration = 5000,
}) => {
    React.useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2">
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-2 font-bold text-lg hover:text-red-200"
                >
                    ×
                </button>
            )}
        </div>
    );
};