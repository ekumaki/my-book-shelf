import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useTheme } from '../../context/ThemeContext';
import BookItem from './BookItem';
import { Books, CaretDown, SortAscending, BookBookmark, Heart, BookOpen, CheckCircle, Star } from '@phosphor-icons/react';

// Smart shelf definitions
const SMART_SHELVES = [
    { id: '__all__', title: 'すべての本', icon: Books, status: null },
    { id: '__unread__', title: '積読', icon: BookBookmark, status: 'unread' },
    { id: '__wants__', title: '読みたい', icon: Heart, status: 'wants' },
    { id: '__reading__', title: '読書中', icon: BookOpen, status: 'reading' },
    { id: '__read__', title: '読了', icon: CheckCircle, status: 'read' },
] as const;

export default function ShelfView() {
    const { theme, themeId } = useTheme();
    const [sort, setSort] = useState('registeredAt');
    const [selectedShelfId, setSelectedShelfId] = useState<string>(() => localStorage.getItem('selected_shelf_id') || '__all__');
    const [showShelfDropdown, setShowShelfDropdown] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    const customShelves = useLiveQuery(() => db.shelves.orderBy('createdAt').reverse().toArray(), []);
    const selectedCustomShelf = useLiveQuery(
        () => selectedShelfId.startsWith('__') ? undefined : db.shelves.get(selectedShelfId),
        [selectedShelfId]
    );

    const books = useLiveQuery(async () => {
        let collection = await db.books.toArray();

        // Filter by shelf
        if (selectedShelfId.startsWith('__')) {
            // Smart shelf - filter by status
            const smartShelf = SMART_SHELVES.find(s => s.id === selectedShelfId);
            if (smartShelf && smartShelf.status) {
                collection = collection.filter(b => b.status === smartShelf.status);
            }
        } else if (selectedCustomShelf) {
            // Custom shelf - filter by bookIds
            const shelfBookIds = new Set(selectedCustomShelf.bookIds);
            collection = collection.filter(b => shelfBookIds.has(b.id));
        }

        // Sort
        const sorted = collection.sort((a, b) => {
            if (sort === 'registeredAt') return b.registeredAt - a.registeredAt;
            if (sort === 'title') return a.title.localeCompare(b.title);
            if (sort === 'authors') return (a.authors[0] || '').localeCompare(b.authors[0] || '');
            if (sort === 'finishedDate') return (b.finishedDate || '').localeCompare(a.finishedDate || '');
            return 0;
        });

        return [...sorted]; // Return a new array reference to ensure React detects the change
    }, [sort, selectedShelfId, selectedCustomShelf]);

    const isPureWhite = themeId === 'pure_white';

    const handleShelfSelect = (shelfId: string) => {
        setSelectedShelfId(shelfId);
        localStorage.setItem('selected_shelf_id', shelfId);
        setShowShelfDropdown(false);
    };

    const handleSortSelect = (sortKey: string) => {
        setSort(sortKey);
        setShowSortMenu(false);
    };

    // Get current shelf label
    const getCurrentShelfLabel = () => {
        const smartShelf = SMART_SHELVES.find(s => s.id === selectedShelfId);
        if (smartShelf) return smartShelf.title;
        if (selectedCustomShelf) return selectedCustomShelf.title;
        return 'すべての本';
    };

    const sortOptions = [
        { key: 'registeredAt', label: '登録順' },
        { key: 'title', label: 'タイトル順' },
        { key: 'authors', label: '著者順' },
        { key: 'finishedDate', label: '読了日順' },
    ];

    return (
        <div className={`h-full flex flex-col ${theme.cssClass} ${theme.textColor}`}>
            {/* Simplified Header */}
            <div className={`p-3 ${theme.bgColor} ${isPureWhite ? '' : 'backdrop-blur-sm shadow-md'} flex items-center z-10 sticky top-0 transition-colors`}>
                {/* Left: Spacer (to match right side width for centering) */}
                <div className="w-10" />

                {/* Center: Shelf Selector */}
                <div className="flex-1 flex justify-center relative min-w-0">
                    <button
                        onClick={() => { setShowShelfDropdown(!showShelfDropdown); setShowSortMenu(false); }}
                        className={`flex items-center gap-1 text-lg font-bold ${theme.textColor} hover:opacity-80 transition-opacity max-w-full`}
                    >
                        <span className="truncate max-w-[240px] block">{getCurrentShelfLabel()}</span>
                        <CaretDown size={16} weight="bold" className={`transition-transform shrink-0 ${showShelfDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showShelfDropdown && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-lg border z-50 min-w-[200px] py-1 max-h-80 overflow-y-auto">
                            {/* Smart Shelves */}
                            {SMART_SHELVES.map(shelf => (
                                <button
                                    key={shelf.id}
                                    onClick={() => handleShelfSelect(shelf.id)}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-100 ${selectedShelfId === shelf.id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}
                                >
                                    <shelf.icon size={18} weight="fill" />
                                    {shelf.title}
                                </button>
                            ))}

                            {/* Custom Shelves */}
                            {customShelves && customShelves.length > 0 && (
                                <>
                                    {customShelves.map(shelf => (
                                        <button
                                            key={shelf.id}
                                            onClick={() => handleShelfSelect(shelf.id)}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-100 ${selectedShelfId === shelf.id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            <Star size={18} weight="fill" className="shrink-0" />
                                            <span className="truncate flex-1 text-left">{shelf.title}</span>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Sort Menu */}
                <div className="relative">
                    <button
                        onClick={() => { setShowSortMenu(!showSortMenu); setShowShelfDropdown(false); }}
                        className={`p-2 ${theme.subTextColor} hover:opacity-80 transition-opacity flex items-center justify-center w-10`}
                    >
                        <SortAscending size={22} weight="bold" />
                    </button>

                    {showSortMenu && (
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 min-w-[140px] py-1">
                            {sortOptions.map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => handleSortSelect(option.key)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sort === option.key ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Book Grid */}
            <div
                className="flex-1 overflow-y-auto pb-28 pt-4 px-0 relative"
                onClick={() => { setShowShelfDropdown(false); setShowSortMenu(false); }}
            >
                <div className="flex flex-wrap items-end gap-y-4">
                    {!books || books.length === 0 ? (
                        <div className={`w-full h-64 flex flex-col items-center justify-center ${theme.subTextColor}`}>
                            <Books size={48} className="mb-2 opacity-50" />
                            <p>本がありません</p>
                            <p className="text-sm opacity-70">検索画面から本を追加してください</p>
                        </div>
                    ) : (
                        Array.from({ length: Math.ceil(books.length / 3) }, (_, i) =>
                            books.slice(i * 3, i * 3 + 3)
                        ).map((row, rowIndex) => (
                            <div key={rowIndex} className="mb-4 w-full">
                                <div className="flex items-end px-2 w-full">
                                    {row.map((book) => (
                                        <BookItem key={book.id} book={book} />
                                    ))}
                                </div>
                                <div className="w-full h-4 shelf-board"></div>
                            </div>
                        ))
                    )}
                </div>
                <div className="h-32"></div>
            </div>
        </div>
    );
}
