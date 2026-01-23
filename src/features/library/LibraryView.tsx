import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../db/db';
import type { Shelf } from '../../types';
import { Plus, Trash, Books, Check, X, MagnifyingGlass, BookOpen, Heart, BookBookmark, CheckCircle, Bank, Star, Info, ArrowSquareOut } from '@phosphor-icons/react';
import clsx from 'clsx';

// Smart shelves (fixed, cannot be deleted)
const SMART_SHELVES = [
    { id: '__all__', title: 'すべての本', icon: Books, status: null },
    { id: '__unread__', title: '積読', icon: BookBookmark, status: 'unread' },
    { id: '__wants__', title: '読みたい', icon: Heart, status: 'wants' },
    { id: '__reading__', title: '読書中', icon: BookOpen, status: 'reading' },
    { id: '__read__', title: '読了', icon: CheckCircle, status: 'read' },
] as const;

type Mode = 'list' | 'edit';

interface ShelfFormState {
    id?: string;
    title: string;
    description: string;
    selectedBookIds: Set<string>;
}

const initialFormState: ShelfFormState = {
    title: '',
    description: '',
    selectedBookIds: new Set()
};



export default function LibraryView() {

    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState<Mode>('list');
    const [formState, setFormState] = useState<ShelfFormState>(initialFormState);
    const [bookFilter, setBookFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(''); // YYYY-MM

    const shelves = useLiveQuery(() => db.shelves.orderBy('createdAt').reverse().toArray(), []);
    const allBooks = useLiveQuery(() => db.books.orderBy('registeredAt').reverse().toArray(), []);

    // Handle editing via navigation state
    useEffect(() => {
        const state = location.state as { editShelfId?: string } | null;
        if (state?.editShelfId) {
            db.shelves.get(state.editShelfId).then(shelf => {
                if (shelf) {
                    handleEditShelf(shelf);
                    // Clear state so it doesn't reopen on refresh
                    window.history.replaceState({}, document.title);
                }
            });
        }
    }, [location.state, shelves]); // Added shelves dependency to ensure we have data if needed

    // Count books by status
    const bookCounts = useLiveQuery(async () => {
        const books = await db.books.toArray();
        return {
            all: books.length,
            unread: books.filter(b => b.status === 'unread').length,
            wants: books.filter(b => b.status === 'wants').length,
            reading: books.filter(b => b.status === 'reading').length,
            read: books.filter(b => b.status === 'read').length,
        };
    }, []);

    const filteredBooks = allBooks?.filter(book => {
        const matchesSearch = bookFilter === '' ||
            book.title.toLowerCase().includes(bookFilter.toLowerCase()) ||
            book.authors.some(a => a.toLowerCase().includes(bookFilter.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
        const matchesDate = !dateFilter || (book.finishedDate && book.finishedDate.startsWith(dateFilter));
        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleNewShelf = () => {
        setFormState(initialFormState);
        setMode('edit');
    };

    const handleEditShelf = (shelf: Shelf) => {
        setFormState({
            id: shelf.id,
            title: shelf.title,
            description: shelf.description || '',
            selectedBookIds: new Set(shelf.bookIds)
        });
        setMode('edit');
    };



    const handleSave = async () => {
        if (!formState.title.trim()) {
            alert('本棚名を入力してください');
            return;
        }

        const shelfData = {
            id: formState.id || crypto.randomUUID(),
            title: formState.title.trim(),
            description: formState.description.trim(),
            bookIds: Array.from(formState.selectedBookIds),
            createdAt: formState.id ? (await db.shelves.get(formState.id))?.createdAt || Date.now() : Date.now()
        };

        if (formState.id) {
            await db.shelves.update(formState.id, shelfData);
        } else {
            await db.shelves.add(shelfData);
        }

        setMode('list');
        setFormState(initialFormState);
    };

    const handleCancel = () => {
        setMode('list');
        setFormState(initialFormState);
    };

    const toggleBookSelection = (bookId: string) => {
        setFormState(prev => {
            const newSet = new Set(prev.selectedBookIds);
            if (newSet.has(bookId)) {
                newSet.delete(bookId);
            } else {
                newSet.add(bookId);
            }
            return { ...prev, selectedBookIds: newSet };
        });
    };

    const getSmartShelfCount = (status: string | null) => {
        if (!bookCounts) return 0;
        if (status === null) return bookCounts.all;
        return bookCounts[status as keyof typeof bookCounts] || 0;
    };

    const handleEditSmartShelf = async (shelf: typeof SMART_SHELVES[number]) => {
        if (!allBooks) return;

        const shelfBookIds = allBooks
            .filter(b => !shelf.status || b.status === shelf.status)
            .map(b => b.id);

        setFormState({
            id: shelf.id,
            title: shelf.title,
            description: '',
            selectedBookIds: new Set(shelfBookIds)
        });
        setMode('edit');
    };

    const isSmartShelf = formState.id?.startsWith('__');

    // List Mode
    if (mode === 'list') {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="bg-white backdrop-blur-md border-b border-gray-200 p-4 shadow-md z-10 shrink-0 transition-colors">
                    <div className="flex items-center justify-center gap-2">
                        <Bank size={24} className="text-gray-900" weight="fill" />
                        <h1 className="text-xl font-bold text-gray-900">ライブラリ</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {/* Smart Shelves */}
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-500 mb-2 px-1">スマート本棚</h2>
                        <div className="space-y-2">
                            {SMART_SHELVES.map(shelf => (
                                <div
                                    key={shelf.id}
                                    onClick={() => handleEditSmartShelf(shelf)}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <shelf.icon size={20} className="text-amber-600" weight="fill" />
                                    <span className="flex-1 font-medium text-gray-800">{shelf.title}</span>
                                    <span className="text-sm text-gray-400">{getSmartShelfCount(shelf.status)}冊</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Custom Shelves */}
                    <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-sm font-bold text-gray-500">カスタム本棚</h2>
                            <button
                                onClick={handleNewShelf}
                                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                            >
                                <Plus size={16} weight="bold" />
                                新規作成
                            </button>
                        </div>
                        {!shelves || shelves.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-dashed">
                                <Bank size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">カスタム本棚はありません</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {shelves.map(shelf => (
                                    <div
                                        key={shelf.id}
                                        onClick={() => handleEditShelf(shelf)}
                                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <Star size={20} className="text-amber-600" weight="fill" />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800">{shelf.title}</h3>
                                            {shelf.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{shelf.description}</p>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {shelf.bookIds.filter(id => allBooks?.some(b => b.id === id)).length}冊
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Edit Mode
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white backdrop-blur-md border-b border-gray-200 p-3 flex items-center gap-3 shadow-md z-10 shrink-0 transition-colors">
                <button onClick={handleCancel} className="text-gray-900 p-1 rounded-full hover:opacity-70">
                    <X size={20} />
                </button>
                <h2 className="font-bold flex-1 text-gray-900">
                    {isSmartShelf ? '本棚を確認' : (formState.id ? '本棚を編集' : '新しい本棚')}
                </h2>
                {!isSmartShelf && (
                    <button
                        onClick={handleSave}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        <Check size={16} weight="bold" />
                        保存
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Read-only Notice */}
                {isSmartShelf && (
                    <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center gap-2 text-blue-700 text-sm">
                        <Info size={18} weight="fill" />
                        <span>スマート本棚は自動更新されるため、編集できません。</span>
                    </div>
                )}

                {/* Form Fields */}
                <div className="bg-white p-4 border-b">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">本棚名 *</label>
                        <input
                            type="text"
                            value={formState.title}
                            onChange={e => !isSmartShelf && setFormState(prev => ({ ...prev, title: e.target.value }))}
                            onBlur={() => window.scrollTo(0, 0)}
                            placeholder="例：2025年に読みたい本"
                            disabled={isSmartShelf}
                            className={clsx(
                                "w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white shadow-sm",
                                isSmartShelf ? "bg-gray-50 text-gray-400" : "text-gray-900"
                            )}
                        />
                    </div>
                </div>

                {/* Delete Button for existing shelves */}
                {formState.id && !isSmartShelf && (
                    <div className="p-4 bg-white border-b">
                        <button
                            onClick={() => {
                                if (confirm('この本棚を削除しますか？')) {
                                    db.shelves.delete(formState.id!);
                                    setMode('list');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors font-medium"
                        >
                            <Trash size={18} weight="bold" />
                            本棚を削除
                        </button>
                    </div>
                )}

                {/* Book Selection */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-700 mb-3">
                        {isSmartShelf
                            ? `登録されている本 (${Array.from(formState.selectedBookIds).filter(id => allBooks?.some(b => b.id === id)).length}冊)`
                            : `本を選択 (${Array.from(formState.selectedBookIds).filter(id => allBooks?.some(b => b.id === id)).length}冊選択中)`}
                    </h3>

                    {/* Filters */}
                    <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={bookFilter}
                                onChange={e => setBookFilter(e.target.value)}
                                placeholder="タイトル・著者で検索..."
                                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white shadow-sm text-gray-900"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => {
                                setStatusFilter(e.target.value);
                                setDateFilter('');
                            }}
                            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white shadow-sm text-gray-900"
                        >
                            <option value="all">すべて</option>
                            <option value="unread">積読</option>
                            <option value="wants">読みたい</option>
                            <option value="reading">読書中</option>
                            <option value="read">読了</option>
                        </select>
                        {statusFilter === 'read' && (
                            <div className="relative flex items-center">
                                <input
                                    type="month"
                                    value={dateFilter}
                                    onChange={e => setDateFilter(e.target.value)}
                                    className="border border-gray-200 rounded-lg pl-2 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white shadow-sm text-gray-900"
                                />
                                {dateFilter && (
                                    <button
                                        onClick={() => setDateFilter('')}
                                        className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
                                        title="リセット"
                                    >
                                        <X size={14} weight="bold" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Book List */}
                    {!filteredBooks || filteredBooks.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>該当する本がありません</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredBooks.map(book => {
                                const isSelected = formState.selectedBookIds.has(book.id);
                                return (
                                    <label
                                        key={book.id}
                                        className={clsx(
                                            "flex items-center gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer transition-colors",
                                            isSelected ? "bg-amber-50 border-amber-300" : "bg-white hover:bg-gray-50"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => !isSmartShelf && toggleBookSelection(book.id)}
                                            disabled={isSmartShelf}
                                            className={clsx(
                                                "w-5 h-5 rounded focus:ring-amber-500",
                                                isSmartShelf ? "text-gray-400 bg-gray-100 border-gray-300" : "text-amber-600"
                                            )}
                                        />
                                        {book.thumbnail ? (
                                            <img
                                                src={book.thumbnail}
                                                alt=""
                                                className={clsx(
                                                    "w-10 h-14 object-cover rounded shadow-sm transition-opacity",
                                                    isSmartShelf && !isSelected && "opacity-40 grayscale-[50%]"
                                                )}
                                            />
                                        ) : (
                                            <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <div className={clsx(
                                            "flex-1 min-w-0 transition-opacity",
                                            isSmartShelf && !isSelected && "opacity-40"
                                        )}>
                                            <p className="font-medium text-gray-800 text-sm truncate">{book.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{book.authors.join(', ')}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(`/book/${book.id}`);
                                            }}
                                            className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                                            title="詳細を見る"
                                        >
                                            <ArrowSquareOut size={20} />
                                        </button>
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
