import { cn } from '@/lib/utils';
import { Recycle } from 'lucide-react';

interface AppLogoProps {
    className?: string;
    showText?: boolean;
}

export default function AppLogo({ className, showText = true }: AppLogoProps) {
    return (
        <div className={cn("flex items-center space-x-3", className)}>
            {/* Recycle Logo Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Recycle className="w-6 h-6 text-white" />
            </div>
            
            {/* Text */}
            {showText && (
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                        BANK SAMPAH
                    </h1>
                    <p className="text-xs text-gray-500 leading-tight">
                        Digital Platform
                    </p>
                </div>
            )}
        </div>
    );
}
