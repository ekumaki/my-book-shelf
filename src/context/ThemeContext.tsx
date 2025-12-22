import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Theme, ThemeId } from '../types';


const THEMES: Record<ThemeId, Theme> = {
    'dark_wood': {
        id: 'dark_wood',
        label: 'ダークウッド (標準)',
        cssClass: 'theme-dark-wood',
        textColor: 'text-white',
        subTextColor: 'text-white/70',
        borderColor: 'border-white/20',
        bgColor: 'bg-black/20'
    },
    'light_wood': {
        id: 'light_wood',
        label: 'ライトウッド (明るい)',
        cssClass: 'theme-light-wood',
        textColor: 'text-gray-800',
        subTextColor: 'text-gray-600',
        borderColor: 'border-gray-800/20',
        bgColor: 'bg-white/40'
    },
    'pure_white': {
        id: 'pure_white',
        label: '真っ白',
        cssClass: 'theme-pure-white',
        textColor: 'text-gray-900',
        subTextColor: 'text-gray-600',
        borderColor: 'border-gray-300',
        bgColor: 'bg-white'
    }
};

interface ThemeContextType {
    themeId: ThemeId;
    theme: Theme;
    setThemeId: (id: ThemeId) => void;
    availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeId, setThemeIdState] = useState<ThemeId>(() => {
        return (localStorage.getItem('bk_theme') as ThemeId) || 'dark_wood';
    });

    const setThemeId = (id: ThemeId) => {
        setThemeIdState(id);
        localStorage.setItem('bk_theme', id);
    };

    const theme = THEMES[themeId];
    const availableThemes = Object.values(THEMES);

    return (
        <ThemeContext.Provider value={{ themeId, theme, setThemeId, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
