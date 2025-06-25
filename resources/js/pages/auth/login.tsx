import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Recycle, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Masuk ke Bank Sampah" 
            description="Kelola aktivitas bank sampah RT dengan mudah dan efisien"
        >
            <Head title="Masuk" />

            {/* Status Message */}
            {status && (
                <div className="mb-6 p-4 text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    {status}
                </div>
            )}

            {/* Welcome Section */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                        <Recycle className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang!</h2>
                <p className="text-gray-600 text-sm">
                    Masuk ke sistem pengelolaan Bank Sampah RT untuk melanjutkan aktivitas Anda
                </p>
            </div>

            <form className="space-y-6" onSubmit={submit}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            className="h-12 pl-4 pr-4 text-base border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Kata Sandi
                        </Label>
                        {canResetPassword && (
                            <button
                                type="button"
                                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                                tabIndex={5}
                                onClick={() => window.location.href = route('password.request')}
                            >
                                Lupa kata sandi?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Masukkan kata sandi Anda"
                            className="h-12 pl-4 pr-12 text-base border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', !!checked)}
                            tabIndex={3}
                            className="border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                            Ingat saya
                        </Label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed" 
                    tabIndex={4} 
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-5 w-5 mr-2" />
                            Masuk ke Sistem
                        </>
                    )}
                </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Keamanan Data Terjamin
                        </h4>
                        <p className="text-xs text-blue-700">
                            Sistem ini menggunakan enkripsi tingkat tinggi untuk melindungi data pribadi dan transaksi Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                    © 2025 Bank Sampah RT. Sistem Pengelolaan Sampah Berkelanjutan.
                </p>
            </div>
        </AuthLayout>
    );
}
