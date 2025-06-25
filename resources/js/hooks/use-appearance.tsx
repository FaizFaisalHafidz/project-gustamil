import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light'; // Hanya light mode saja

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Selalu force light mode
    document.documentElement.classList.remove('dark');
    
    // Tambahan: pastikan tidak ada dark class yang tersisa
    if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        
        // Force light mode styles
        document.documentElement.style.colorScheme = 'light';
        document.body.style.backgroundColor = 'white';
        document.body.style.color = 'rgb(17, 24, 39)';
    }
};

export function initializeTheme() {
    // Selalu gunakan light mode
    const savedAppearance: Appearance = 'light';
    
    applyTheme(savedAppearance);
    
    // Clear any existing theme preferences that might cause conflicts
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('appearance', 'light');
    }
    
    setCookie('appearance', 'light');
    
    // Hapus semua event listener untuk system theme changes
    // karena kita tidak menggunakan system detection
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Hanya terima 'light' mode
        const lightMode: Appearance = 'light';
        
        setAppearance(lightMode);

        // Store in localStorage sebagai light
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('appearance', lightMode);
        }

        // Store in cookie sebagai light
        setCookie('appearance', lightMode);

        applyTheme(lightMode);
    }, []);

    useEffect(() => {
        // Selalu gunakan light mode, abaikan localStorage
        const lightMode: Appearance = 'light';
        
        // Clear any existing dark mode settings
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('appearance', lightMode);
        }
        setCookie('appearance', lightMode);
        
        updateAppearance(lightMode);
        
        // Force apply theme immediately
        applyTheme(lightMode);
        
        // Tidak perlu cleanup karena tidak ada event listener
    }, [updateAppearance]);

    // Force light mode on every render to ensure consistency
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return { appearance, updateAppearance } as const;
}
