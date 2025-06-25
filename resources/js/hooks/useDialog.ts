import { useState } from 'react';

export interface DialogConfig {
    title: string;
    message: string;
    type?: 'success' | 'warning' | 'error' | 'info';
    confirmText?: string;
    cancelText?: string;
}

export function useDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<DialogConfig>({
        title: '',
        message: '',
        type: 'warning',
    });
    const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showDialog = (dialogConfig: DialogConfig, onConfirm: () => void) => {
        setConfig(dialogConfig);
        setOnConfirmCallback(() => onConfirm);
        setIsOpen(true);
        setIsLoading(false);
    };

    const hideDialog = () => {
        setIsOpen(false);
        setIsLoading(false);
        setOnConfirmCallback(null);
    };

    const confirm = async () => {
        if (onConfirmCallback) {
            setIsLoading(true);
            try {
                await onConfirmCallback();
                hideDialog();
            } catch (error) {
                setIsLoading(false);
                // Handle error if needed
            }
        }
    };

    return {
        isOpen,
        config,
        isLoading,
        showDialog,
        hideDialog,
        confirm,
    };
}