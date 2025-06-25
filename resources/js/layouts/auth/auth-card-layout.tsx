import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Leaf, Recycle } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center">
                        <div className="flex items-center space-x-3 p-4 bg-white rounded-full shadow-lg border border-green-100">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                                <Recycle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="font-bold text-lg text-gray-900">Bank Sampah</h1>
                                <p className="text-xs text-gray-600">Pengelolaan RT</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Main Card */}
                <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl rounded-2xl overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-2 text-center bg-gradient-to-r from-green-500/5 to-blue-500/5">
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-8">
                        {children}
                    </CardContent>
                </Card>

                {/* Features Preview */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-green-100">
                        <Recycle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-700">Kelola Setoran</p>
                    </div>
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100">
                        <Leaf className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-700">Ramah Lingkungan</p>
                    </div>
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-green-100">
                        <svg className="h-6 w-6 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-xs font-medium text-gray-700">Laporan Lengkap</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
