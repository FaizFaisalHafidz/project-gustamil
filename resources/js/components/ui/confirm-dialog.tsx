import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'success' | 'warning' | 'error' | 'info';
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

const iconMap = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
};

const colorMap = {
    success: {
        icon: 'text-green-600',
        bg: 'bg-green-100',
        button: 'bg-green-600 hover:bg-green-700',
        border: 'border-green-200',
    },
    warning: {
        icon: 'text-orange-600',
        bg: 'bg-orange-100',
        button: 'bg-orange-600 hover:bg-orange-700',
        border: 'border-orange-200',
    },
    error: {
        icon: 'text-red-600',
        bg: 'bg-red-100',
        button: 'bg-red-600 hover:bg-red-700',
        border: 'border-red-200',
    },
    info: {
        icon: 'text-blue-600',
        bg: 'bg-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700',
        border: 'border-blue-200',
    },
};

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    isLoading = false,
}: ConfirmDialogProps) {
    const Icon = iconMap[type];
    const colors = colorMap[type];

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={!isLoading ? onClose : undefined}
            />
            
            {/* Dialog */}
            <div className="relative z-10 w-full max-w-sm mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
                <Card className={`bg-white shadow-2xl border-0 overflow-hidden ${colors.border}`}>
                    {/* Header with Icon */}
                    <CardHeader className="text-center pb-2 relative">
                        {/* Close button */}
                        {!isLoading && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        
                        {/* Icon */}
                        <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            <Icon className={`h-8 w-8 ${colors.icon}`} />
                        </div>
                        
                        {/* Title */}
                        <CardTitle className="text-lg font-bold text-gray-900">
                            {title}
                        </CardTitle>
                    </CardHeader>

                    {/* Content */}
                    <CardContent className="text-center pb-6">
                        <CardDescription className="text-gray-600 text-sm leading-relaxed mb-6">
                            {message}
                        </CardDescription>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`w-full ${colors.button} text-white font-medium`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Memproses...
                                    </div>
                                ) : (
                                    confirmText
                                )}
                            </Button>
                            
                            <Button
                                onClick={onClose}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                {cancelText}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}