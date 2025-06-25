import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Clock, MessageCircle, Phone, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

interface AccountInactiveProps {
    user: {
        name: string;
        email: string;
    };
    anggota?: {
        nomor_anggota: string;
        nama_lengkap: string;
        // tanggal_daftar: string;
    };
}

export default function AccountInactive({ user, anggota }: AccountInactiveProps) {
    return (
        <AuthLayout 
            title="Akun Tidak Aktif" 
            description="Akun Anda saat ini tidak aktif dan memerlukan aktivasi dari pengelola"
        >
            <Head title="Akun Tidak Aktif" />

            {/* Warning Icon */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
                        <AlertTriangle className="h-10 w-10 text-orange-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Akun Tidak Aktif</h2>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Akun Anda saat ini tidak aktif dan tidak dapat mengakses sistem Bank Sampah
                </p>
            </div>

            {/* Account Info */}
            <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-orange-800">
                        <User className="h-5 w-5 mr-2" />
                        Informasi Akun
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700">Nama:</span>
                        <span className="text-sm text-orange-900">{user.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700">Email:</span>
                        <span className="text-sm text-orange-900">{user.email}</span>
                    </div>
                    {anggota && (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-orange-700">No. Anggota:</span>
                                <span className="text-sm text-orange-900">{anggota.nomor_anggota}</span>
                            </div>
                            {/* <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-orange-700">Terdaftar:</span>
                                <span className="text-sm text-orange-900">
                                    {new Date(anggota.tanggal_daftar).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div> */}
                        </>
                    )}
                    <div className="pt-2 border-t border-orange-200">
                        <div className="flex items-center text-orange-700">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Status: Non-Aktif</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-800">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Cara Mengaktifkan Akun
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">1</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Hubungi Pengelola Bank Sampah</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Silakan menghubungi pengelola Bank Sampah RT untuk aktivasi akun Anda
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">2</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Verifikasi Data Diri</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Pengelola akan memverifikasi data diri dan status keanggotaan Anda
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">3</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Aktivasi Akun</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Setelah diverifikasi, akun Anda akan diaktifkan dan dapat digunakan
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-green-800">
                        <Phone className="h-5 w-5 mr-2" />
                        Kontak Pengelola
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-center">
                        <p className="text-sm font-medium text-green-800 mb-2">
                            Bank Sampah RT
                        </p>
                        <div className="space-y-1">
                            <p className="text-sm text-green-700">
                                📞 Telepon: (021) 1234-5678
                            </p>
                            <p className="text-sm text-green-700">
                                📱 WhatsApp: 0812-3456-7890
                            </p>
                            <p className="text-sm text-green-700">
                                📧 Email: pengelola@banksampahrt.com
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
                <Link href="/login">
                    <Button 
                        variant="outline" 
                        className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Halaman Login
                    </Button>
                </Link>
                
                <Button 
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open('https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20mengaktifkan%20akun%20Bank%20Sampah%20saya', '_blank')}
                >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Hubungi via WhatsApp
                </Button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                    Butuh bantuan? Hubungi pengelola Bank Sampah RT pada jam kerja (08:00 - 17:00 WIB)
                </p>
            </div>
        </AuthLayout>
    );
}