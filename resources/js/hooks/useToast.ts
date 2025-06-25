import { ToastProps } from '@/components/ui/toast';
import { useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
        const id = Date.now().toString();
        const newToast: ToastProps = {
            ...toast,
            id,
            onClose: removeToast,
        };
        
        setToasts((prev) => {
            // Limit to 3 toasts maximum for mobile
            const newToasts = [...prev, newToast];
            return newToasts.slice(-3);
        });
        
        return id;
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const clearAll = () => {
        setToasts([]);
    };

    const showSuccess = (title: string, message?: string, duration = 3000) => {
        return addToast({ title, message, type: 'success', duration });
    };

    const showError = (title: string, message?: string, duration = 4000) => {
        return addToast({ title, message, type: 'error', duration });
    };

    const showWarning = (title: string, message?: string, duration = 3500) => {
        return addToast({ title, message, type: 'warning', duration });
    };

    const showInfo = (title: string, message?: string, duration = 3000) => {
        return addToast({ title, message, type: 'info', duration });
    };

    return {
        toasts,
        addToast,
        removeToast,
        clearAll,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}