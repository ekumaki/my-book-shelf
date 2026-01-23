import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Theme, ThemeId, CoverBackground, CoverBackgroundId } from '../types';


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
    },
    'pitch_black': {
        id: 'pitch_black',
        label: '真っ黒',
        cssClass: 'theme-pitch-black',
        textColor: 'text-gray-200',
        subTextColor: 'text-gray-400',
        borderColor: 'border-gray-800',
        bgColor: 'bg-black'
    }
};

const COVER_BACKGROUNDS: Record<CoverBackgroundId, CoverBackground> = {
    'wooden_stand': {
        id: 'wooden_stand',
        label: '木製スタンド風',
        cssClass: 'cover-bg-wooden-stand'
    },
    'gradient': {
        id: 'gradient',
        label: 'グラデーション',
        cssClass: 'cover-bg-gradient'
    },
    'white': {
        id: 'white',
        label: '真っ白',
        cssClass: 'cover-bg-white'
    },
    'pitch_black': {
        id: 'pitch_black',
        label: '真っ黒',
        cssClass: 'cover-bg-pitch-black'
    }
};

interface ThemeContextType {
    themeId: ThemeId;
    theme: Theme;
    setThemeId: (id: ThemeId) => void;
    availableThemes: Theme[];
    coverBackgroundId: CoverBackgroundId;
    coverBackground: CoverBackground;
    setCoverBackgroundId: (id: CoverBackgroundId) => void;
    availableCoverBackgrounds: CoverBackground[];
    showScanner: boolean;
    setShowScanner: (show: boolean) => void;
}


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeId, setThemeIdState] = useState<ThemeId>(() => {
        return (localStorage.getItem('bk_theme') as ThemeId) || 'dark_wood';
    });

    const [coverBackgroundId, setCoverBackgroundIdState] = useState<CoverBackgroundId>(() => {
        return (localStorage.getItem('bk_cover_bg') as CoverBackgroundId) || 'wooden_stand';
    });
    const [showScanner, setShowScanner] = useState(false);


    const setThemeId = (id: ThemeId) => {
        setThemeIdState(id);
        localStorage.setItem('bk_theme', id);
    };

    const setCoverBackgroundId = (id: CoverBackgroundId) => {
        setCoverBackgroundIdState(id);
        localStorage.setItem('bk_cover_bg', id);
    };

    const theme = THEMES[themeId] || THEMES['dark_wood'];
    const availableThemes = Object.values(THEMES);
    const coverBackground = COVER_BACKGROUNDS[coverBackgroundId] || COVER_BACKGROUNDS['wooden_stand'];
    const availableCoverBackgrounds = Object.values(COVER_BACKGROUNDS);

    return (
        <ThemeContext.Provider value={{
            themeId,
            theme,
            setThemeId,
            availableThemes,
            coverBackgroundId,
            coverBackground,
            setCoverBackgroundId,
            availableCoverBackgrounds,
            showScanner,
            setShowScanner
        }}>

            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
