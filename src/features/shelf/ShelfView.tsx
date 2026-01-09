import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useTheme } from '../../context/ThemeContext';
import BookItem from './BookItem';
import { Books, Bookmarks, CaretDown } from '@phosphor-icons/react';

export default function ShelfView() {
    const navigate = useNavigate();
    const { theme, themeId } = useTheme();
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('registeredAt');
    const [monthFilter, setMonthFilter] = useState('all');
    const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
    const [showShelfDropdown, setShowShelfDropdown] = useState(false);

    const shelves = useLiveQuery(() => db.shelves.orderBy('createdAt').reverse().toArray(), []);
    const selectedShelf = useLiveQuery(
        () => selectedShelfId ? db.shelves.get(selectedShelfId) : undefined,
        [selectedShelfId]
    );

    const books = useLiveQuery(async () => {
        let collection = await db.books.toArray();

        // Filter by shelf if selected
        if (selectedShelfId && selectedShelf) {
            const shelfBookIds = new Set(selectedShelf.bookIds);
            collection = collection.filter(b => shelfBookIds.has(b.id));
        }

        // Sort
        collection.sort((a, b) => {
            if (sort === 'registeredAt') return b.registeredAt - a.registeredAt;
            if (sort === 'title') return a.title.localeCompare(b.title);
            if (sort === 'authors') return (a.authors[0] || '').localeCompare(b.authors[0] || '');
            if (sort === 'finishedDate') return (b.finishedDate || '').localeCompare(a.finishedDate || '');
            return 0;
        });

        // Filter by status
        if (filter !== 'all') {
            collection = collection.filter(b => b.status === filter);
        }
        if (monthFilter !== 'all') {
            collection = collection.filter(b => b.status === 'read' && b.finishedDate && b.finishedDate.startsWith(monthFilter));
        }
        return collection;
    }, [filter, sort, monthFilter, selectedShelfId, selectedShelf]);

    const availableMonths = useLiveQuery(async () => {
        const all = await db.books.toArray();
        const s = new Set<string>();
        all.forEach(b => {
            if (b.status === 'read' && b.finishedDate) {
                s.add(b.finishedDate.substring(0, 7));
            }
        });
        return Array.from(s).sort().reverse();
    }, []) || [];

    const isPureWhite = themeId === 'pure_white';

    const handleShelfSelect = (shelfId: string | null) => {
        setSelectedShelfId(shelfId);
        setShowShelfDropdown(false);
    };

    const currentShelfLabel = selectedShelf ? selectedShelf.title : 'すべての本';

    return (
        <div className="h-full flex flex-col">
            <div className={`p-4 ${theme.bgColor} ${isPureWhite ? '' : 'backdrop-blur-sm shadow-md'} flex flex-col gap-2 z-10 sticky top-0 transition-colors`}>
                {/* Title Row with Shelf Selector */}
                <div className="flex items-center justify-center gap-2 relative">
                    <h1 className="text-xl font-bold font-serif tracking-wider flex items-center gap-2">
                        <Books size={24} weight="fill" />
                        My Library
                    </h1>
                    <button
                        onClick={() => navigate('/shelves')}
                        className={`${theme.subTextColor} hover:opacity-80 transition-opacity p-1`}
                        title="本棚管理"
                    >
                        <Bookmarks size={20} weight="fill" />
                    </button>
                </div>

                {/* Shelf Selector Dropdown */}
                <div className="relative flex justify-center">
                    <button
                        onClick={() => setShowShelfDropdown(!showShelfDropdown)}
                        className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full border ${theme.borderColor} ${theme.bgColor} ${theme.textColor} hover:opacity-80 transition-opacity ${isPureWhite ? '' : 'bg-opacity-50'}`}
                    >
                        {currentShelfLabel}
                        <CaretDown size={14} weight="bold" className={`transition-transform ${showShelfDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showShelfDropdown && (
                        <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border z-50 min-w-[160px] py-1 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleShelfSelect(null)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedShelfId === null ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}
                            >
                                すべての本
                            </button>
                            {shelves && shelves.length > 0 && (
                                <>
                                    <div className="border-t my-1" />
                                    {shelves.map(shelf => (
                                        <button
                                            key={shelf.id}
                                            onClick={() => handleShelfSelect(shelf.id)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedShelfId === shelf.id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            {shelf.title}
                                            <span className="text-xs text-gray-400 ml-2">({shelf.bookIds.length})</span>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 justify-center">
                    <select
                        className={`${theme.bgColor} ${theme.textColor} text-xs rounded border ${theme.borderColor} p-1 focus:outline-none ${isPureWhite ? '' : 'bg-opacity-50'}`}
                        value={filter} onChange={e => setFilter(e.target.value)}
                    >
                        <option className="text-gray-900" value="all">すべて</option>
                        <option className="text-gray-900" value="reading">読書中</option>
                        <option className="text-gray-900" value="read">読了</option>
                        <option className="text-gray-900" value="unread">未読</option>
                    </select>
                    <select
                        className={`${theme.bgColor} ${theme.textColor} text-xs rounded border ${theme.borderColor} p-1 focus:outline-none ${isPureWhite ? '' : 'bg-opacity-50'}`}
                        value={sort} onChange={e => setSort(e.target.value)}
                    >
                        <option className="text-gray-900" value="registeredAt">登録順</option>
                        <option className="text-gray-900" value="title">タイトル順</option>
                        <option className="text-gray-900" value="authors">著者順</option>
                        <option className="text-gray-900" value="finishedDate">読了日順</option>
                    </select>
                    <select
                        className={`${theme.bgColor} ${theme.textColor} text-xs rounded border ${theme.borderColor} p-1 focus:outline-none min-w-[100px] ${isPureWhite ? '' : 'bg-opacity-50'}`}
                        value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                    >
                        <option className="text-gray-900" value="all">全期間</option>
                        {availableMonths.map(month => (
                            <option key={month} className="text-gray-900" value={month}>
                                {month.replace('-', '年')}月
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 pt-4 px-2 relative" onClick={() => setShowShelfDropdown(false)}>
                <div className="flex flex-wrap items-end gap-y-4">
                    {!books || books.length === 0 ? (
                        <div className={`w-full h-64 flex flex-col items-center justify-center ${theme.subTextColor}`}>
                            <Books size={48} className="mb-2 opacity-50" />
                            <p>本がありません</p>
                            <p className="text-sm opacity-70">検索画面から本を追加してください</p>
                        </div>
                    ) : (
                        books.map((book) => (
                            <BookItem key={book.id} book={book} />
                        ))
                    )}
                </div>
                {/* Decorative bottom shelf */}
                <div className="w-full h-4 shelf-board mt-4"></div>
                <div className="h-32"></div>
            </div>
        </div>
    );
}
