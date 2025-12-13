import { X, DownloadSimple } from '@phosphor-icons/react';

interface ImageModalProps {
    src: string;
    onClose: () => void;
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
    const handleDownload = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `book_cover_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Direct download failed, opening in new tab", e);
            window.open(src, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white p-2">
                <X size={24} />
            </button>
            <img src={src} className="max-w-full max-h-[80vh] object-contain shadow-2xl mb-4" onClick={(e: React.MouseEvent) => e.stopPropagation()} />

            <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200"
            >
                <DownloadSimple size={20} /> ダウンロード
            </button>
            <p className="text-white/50 text-xs mt-2">※ダウンロードできない場合は別タブで開きます</p>
        </div>
    );
}
