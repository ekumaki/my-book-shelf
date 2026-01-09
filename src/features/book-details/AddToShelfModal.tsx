import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { X, BookmarkSimple, Plus } from '@phosphor-icons/react';

interface AddToShelfModalProps {
    bookId: string;
    onClose: () => void;
}

export default function AddToShelfModal({ bookId, onClose }: AddToShelfModalProps) {
    const [newShelfName, setNewShelfName] = useState('');
    const [showNewShelfInput, setShowNewShelfInput] = useState(false);

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

    const handleCreateShelf = async () => {
        if (!newShelfName.trim()) return;

        const newShelf = {
            id: crypto.randomUUID(),
            title: newShelfName.trim(),
            description: '',
            bookIds: [bookId],
            createdAt: Date.now()
        };

        await db.shelves.add(newShelf);
        setNewShelfName('');
        setShowNewShelfInput(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg flex items-center gap-2">
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
                            本棚がありません。新規作成してください。
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {shelves.map(shelf => {
                                const isIncluded = shelf.bookIds.includes(bookId);
                                return (
                                    <label
                                        key={shelf.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isIncluded}
                                            onChange={() => handleToggleShelf(shelf.id, isIncluded)}
                                            className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{shelf.title}</p>
                                            <p className="text-xs text-gray-500">{shelf.bookIds.length}冊</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* New Shelf Input */}
                <div className="p-4 border-t">
                    {showNewShelfInput ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newShelfName}
                                onChange={e => setNewShelfName(e.target.value)}
                                placeholder="本棚名を入力..."
                                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                autoFocus
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleCreateShelf();
                                    if (e.key === 'Escape') setShowNewShelfInput(false);
                                }}
                            />
                            <button
                                onClick={handleCreateShelf}
                                disabled={!newShelfName.trim()}
                                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                作成
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowNewShelfInput(true)}
                            className="w-full flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 py-2 border border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                            <Plus size={16} weight="bold" />
                            新しい本棚を作成
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
