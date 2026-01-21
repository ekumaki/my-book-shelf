import { X } from '@phosphor-icons/react';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

interface ImageModalProps {
    src: string;
    onClose: () => void;
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
    const { coverBackground } = useTheme();

    // Remove Rakuten's size parameters (?_ex=...) to get the original high-quality image
    const highQualitySrc = useMemo(() => {
        if (!src) return '';
        return src.split('?')[0];
    }, [src]);

    return (
        <div
            className="flex flex-col items-center justify-center bg-black"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100dvw',
                height: '100dvh',
                zIndex: 99999,
            }}
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-6 text-white/80 hover:text-white p-3 bg-black/40 rounded-full backdrop-blur-sm transition-colors z-50 shadow-lg"
            >
                <X size={32} />
            </button>

            {/* Preview Container with fixed Aspect Ratio (3:4, equivalent to 900x1200) */}
            <div
                className={`relative w-full aspect-[3/4] flex items-center justify-center shadow-2xl transition-transform duration-300 pointer-events-none ${coverBackground.cssClass}`}
                style={{
                    maxWidth: 'min(100vw, 900px, calc(100vh * 0.75))',
                }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Internal container to catch clicks and manage content */}
                <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                    {/* Shadow for realism */}
                    <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[63%] h-8 bg-black/60 blur-2xl rounded-[100%]"></div>

                    {/* Book Image */}
                    <img
                        src={highQualitySrc}
                        onError={(e) => {
                            // Fallback to original src if high quality version fails
                            if (e.currentTarget.src !== src) {
                                e.currentTarget.src = src;
                            }
                        }}
                        className="max-w-[67%] max-h-[76%] object-contain rounded-sm relative z-10"
                        style={{
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 2px 0 5px rgba(255, 255, 255, 0.2), inset -2px 0 5px rgba(0, 0, 0, 0.2)'
                        }}
                    />
                </div>
            </div>

            <p className="absolute bottom-10 text-white/70 text-sm bg-black/30 px-6 py-2 rounded-full backdrop-blur-md shadow-sm border border-white/10">
                タップして閉じる
            </p>
        </div>
    );
}
