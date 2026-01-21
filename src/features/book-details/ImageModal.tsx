import { X } from '@phosphor-icons/react';
import { useTheme } from '../../context/ThemeContext';
import { useMemo, useState, useRef } from 'react';

interface ImageModalProps {
    src: string;
    onClose: () => void;
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
    const { coverBackground } = useTheme();

    // Drag state
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Refs for drag calculation
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const initialOffset = useRef({ x: 0, y: 0 });
    const constraints = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

    // Remove Rakuten's size parameters (?_ex=...) to get the original high-quality image
    const highQualitySrc = useMemo(() => {
        if (!src) return '';
        return src.split('?')[0];
    }, [src]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!imageContainerRef.current) return;

        e.preventDefault();
        e.stopPropagation();

        const element = imageContainerRef.current;
        const rect = element.getBoundingClientRect();

        // Calculate constraints ensuring the element stays within the viewport.
        // Since the element is centered by default, the limit in each direction is (viewport_dim - element_dim) / 2.
        const xLimit = Math.max(0, (window.innerWidth - rect.width) / 2);
        const yLimit = Math.max(0, (window.innerHeight - rect.height) / 2);

        constraints.current = {
            minX: -xLimit,
            maxX: xLimit,
            minY: -yLimit,
            maxY: yLimit
        };

        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        initialOffset.current = { ...offset };

        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;

        let newX = initialOffset.current.x + dx;
        let newY = initialOffset.current.y + dy;

        // Clamp values to keep inside screen
        newX = Math.max(constraints.current.minX, Math.min(newX, constraints.current.maxX));
        newY = Math.max(constraints.current.minY, Math.min(newY, constraints.current.maxY));

        setOffset({ x: newX, y: newY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

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

            {/* Preview Container with fixed Aspect Ratio (3:4) */}
            <div
                className={`relative w-full aspect-[3/4] flex items-center justify-center shadow-2xl transition-transform duration-300 ${coverBackground.cssClass}`}
                style={{
                    // Limit size to ensuring some margin maintains drag-ability
                    // Using 95% effectively gives space to move.
                    width: 'min(95vw, calc(95vh * 0.75))',
                    maxWidth: '900px',
                }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Internal container to catch clicks and manage content */}
                <div
                    ref={imageContainerRef}
                    className="relative w-full h-full flex items-center justify-center touch-none select-none"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Shadow for realism */}
                    <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[63%] h-8 bg-black/60 blur-2xl rounded-[100%] pointer-events-none"></div>

                    {/* Book Image */}
                    <img
                        src={highQualitySrc}
                        onError={(e) => {
                            // Fallback to original src if high quality version fails
                            if (e.currentTarget.src !== src) {
                                e.currentTarget.src = src;
                            }
                        }}
                        className="max-w-[67%] max-h-[76%] object-contain rounded-sm relative z-10 pointer-events-none"
                        style={{
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 2px 0 5px rgba(255, 255, 255, 0.2), inset -2px 0 5px rgba(0, 0, 0, 0.2)'
                        }}
                    />
                </div>
            </div>

            <p className="absolute bottom-10 text-white/70 text-sm bg-black/30 px-6 py-2 rounded-full backdrop-blur-md shadow-sm border border-white/10 pointer-events-none">
                タップして閉じる / ドラッグで移動
            </p>
        </div>
    );
}
