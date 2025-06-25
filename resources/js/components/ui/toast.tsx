import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ToastProps {
    id: string;
    title: string;
    message?: string;
    type: 'success' | 'warning' | 'error' | 'info';
    duration?: number;
    onClose: (id: string) => void;
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
        bg: 'bg-green-50',
        border: 'border-green-200',
        progress: 'bg-green-500',
    },
    warning: {
        icon: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        progress: 'bg-orange-500',
    },
    error: {
        icon: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        progress: 'bg-red-500',
    },
    info: {
        icon: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        progress: 'bg-blue-500',
    },
};

export function Toast({ id, title, message, type, duration = 4000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    const Icon = iconMap[type];
    const colors = colorMap[type];

    useEffect(() => {
        // Show toast with slight delay for animation
        const showTimer = setTimeout(() => setIsVisible(true), 50);
        
        // Progress animation
        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 100));
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 100);

        // Auto close
        const closeTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearInterval(progressTimer);
            clearTimeout(closeTimer);
        };
    }, [id, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div className={`transition-all duration-300 ease-out transform ${
            isVisible 
                ? 'translate-y-0 opacity-100 scale-100' 
                : 'translate-y-2 opacity-0 scale-95'
        }`}>
            <Card className={`${colors.bg} ${colors.border} shadow-lg border mb-3 overflow-hidden max-w-sm w-full`}>
                <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            <Icon className={`h-5 w-5 ${colors.icon}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm leading-tight">
                                {title}
                            </p>
                            {message && (
                                <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                                    {message}
                                </p>
                            )}
                        </div>
                        
                        {/* Close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0 -mt-0.5"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </CardContent>
                
                {/* Progress bar */}
                <div className="h-1 bg-gray-200">
                    <div 
                        className={`h-full ${colors.progress} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </Card>
        </div>
    );
}

export function ToastContainer({ toasts, onClose }: { 
    toasts: ToastProps[]; 
    onClose: (id: string) => void; 
}) {
    return (
        <div className="fixed top-4 left-4 right-4 z-50 flex flex-col items-center space-y-2 pointer-events-none">
            <div className="w-full max-w-sm space-y-2 pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
}