import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { X, Prohibit } from '@phosphor-icons/react';

interface BarcodeScannerModalProps {
    onDetected: (isbn: string) => void;
    onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onDetected, onClose }) => {
    const [cameraError, setCameraError] = useState<string | null>(null);

    const { ref } = useZxing({
        onDecodeResult(result) {
            const code = result.getText();
            // Validate EAN-13 (ISBN-13) or EAN-10
            if (/^\d{13}$/.test(code) || /^\d{10}$/.test(code)) {
                onDetected(code);
            }
        },
        onError(error) {
            // "NotAllowedError" usually means permission denied
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    setCameraError('カメラのアクセスが許可されていません。ブラウザの設定を確認してください。');
                } else if (error.name === 'NotFoundError') {
                    setCameraError('カメラが見つかりません。');
                } else {
                    console.warn('Scanner error:', error);
                }
            }
        },

        constraints: {
            video: { facingMode: 'environment' }
        }
    });

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-20">
                <button
                    onClick={onClose}
                    className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                >
                    <X size={24} weight="bold" />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                {cameraError ? (
                    <div className="text-white text-center p-6 max-w-sm flex flex-col items-center gap-4">
                        <Prohibit size={64} className="text-red-500" />
                        <h3 className="text-xl font-bold">カメラーエラー</h3>
                        <p>{cameraError}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-gray-700 rounded-lg font-bold"
                        >
                            閉じる
                        </button>
                    </div>
                ) : (
                    <>
                        <video ref={ref} className="w-full h-full object-cover" />

                        {/* Overlay Frame */}
                        <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
                            <div className="w-[80%] max-w-[300px] h-[150px] border-2 border-amber-500/80 relative rounded-lg">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-white font-bold drop-shadow-md whitespace-nowrap">
                                    バーコードを枠に合わせてください
                                </div>
                                {/* Scanning line animation */}
                                <div className="absolute left-0 right-0 h-[2px] bg-red-500/80 animate-[scan_2s_infinite]" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
