import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { X, BookmarkSimple } from '@phosphor-icons/react';
import clsx from 'clsx';

interface AddToShelfModalProps {
    bookId: string;
    onClose: () => void;
}

export default function AddToShelfModal({ bookId, onClose }: AddToShelfModalProps) {
    const shelves = useLiveQuery(() => db.shelves.orderBy('createdAt').reverse().toArray(), []);

    const handleToggleShelf = async (shelfId: string, currentlyIncluded: boolean) => {
        const shelf = await db.shelves.get(shelfId);
        if (!shelf) return;

        if (currentlyIncluded) {
            // Remove book from shelf
            await db.shelves.update(shelfId, {
                bookIds: shelf.bookIds.filter(id => id !== bookId)
            });
        } else {
            // Add book to shelf
            await db.shelves.update(shelfId, {
                bookIds: [...shelf.bookIds, bookId]
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                        <BookmarkSimple weight="fill" className="text-amber-600" />
                        本棚に追加
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {!shelves || shelves.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                            本棚がありません。ライブラリから作成してください。
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {shelves.map(shelf => {
                                const isIncluded = shelf.bookIds.includes(bookId);
                                return (
                                    <label
                                        key={shelf.id}
                                        className={clsx(
                                            "flex items-center gap-3 p-4 rounded-xl border transition-all shadow-sm cursor-pointer",
                                            isIncluded
                                                ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
                                                : "bg-white border-gray-100 hover:border-amber-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isIncluded}
                                            onChange={() => handleToggleShelf(shelf.id, isIncluded)}
                                            className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx(
                                                "font-bold truncate",
                                                isIncluded ? "text-amber-900" : "text-gray-800"
                                            )}>
                                                {shelf.title}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
