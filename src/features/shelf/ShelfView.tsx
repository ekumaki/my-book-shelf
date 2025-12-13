import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useTheme } from '../../context/ThemeContext';
import BookItem from './BookItem';
import { Books } from '@phosphor-icons/react';

export default function ShelfView() {
    const { theme } = useTheme();
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('registeredAt');
    const [monthFilter, setMonthFilter] = useState('all');

    const books = useLiveQuery(async () => {
        let collection = await db.books.toArray();

        // Sort
        collection.sort((a, b) => {
            if (sort === 'registeredAt') return b.registeredAt - a.registeredAt;
            if (sort === 'title') return a.title.localeCompare(b.title);
            if (sort === 'authors') return (a.authors[0] || '').localeCompare(b.authors[0] || '');
            if (sort === 'finishedDate') return (b.finishedDate || '').localeCompare(a.finishedDate || '');
            return 0;
        });

        // Filter
        if (filter !== 'all') {
            collection = collection.filter(b => b.status === filter);
        }
        if (monthFilter !== 'all') {
            collection = collection.filter(b => b.finishedDate && b.finishedDate.startsWith(monthFilter));
        }
        return collection;
    }, [filter, sort, monthFilter]);

    const availableMonths = useLiveQuery(async () => {
        const all = await db.books.toArray();
        const s = new Set<string>();
        all.forEach(b => {
            if (b.finishedDate) s.add(b.finishedDate.substring(0, 7));
        });
        return Array.from(s).sort().reverse();
    }, []) || [];

    return (
        <div className="h-full flex flex-col">
            <div className={`p-4 ${theme.bgColor} backdrop-blur-sm flex flex-col gap-2 shadow-md z-10 sticky top-0 transition-colors`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold font-serif tracking-wider flex items-center gap-2">
                        <Books size={24} weight="fill" /> My Library
                    </h1>
                    <div className="flex gap-2">
                        <select
                            className={`${theme.bgColor} ${theme.textColor} text-xs rounded border ${theme.borderColor} p-1 focus:outline-none bg-opacity-50`}
                            value={filter} onChange={e => setFilter(e.target.value)}
                        >
                            <option className="text-gray-900" value="all">すべて</option>
                            <option className="text-gray-900" value="reading">読書中</option>
                            <option className="text-gray-900" value="read">読了</option>
                            <option className="text-gray-900" value="unread">未読</option>
                        </select>
                        <select
                            className={`${theme.bgColor} ${theme.textColor} text-xs rounded border ${theme.borderColor} p-1 focus:outline-none bg-opacity-50`}
                            value={sort} onChange={e => setSort(e.target.value)}
                        >
                            <option className="text-gray-900" value="registeredAt">登録順</option>
                            <option className="text-gray-900" value="title">タイトル順</option>
                            <option className="text-gray-900" value="authors">著者順</option>
                            <option className="text-gray-900" value="finishedDate">読了日順</option>
                        </select>
                    </div>
                </div>

                {availableMonths.length > 0 && (
                    <div className="flex items-center gap-2 justify-end">
                        <span className={`text-[10px] ${theme.subTextColor}`}>読了月:</span>
                        <select
                            className={`${theme.bgColor} ${theme.textColor} text-xs rounded border ${theme.borderColor} p-1 focus:outline-none min-w-[100px] bg-opacity-50`}
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
                )}
            </div>

            <div className="flex-1 overflow-y-auto pb-20 pt-8 px-2 relative">
                <div className="flex flex-wrap items-end gap-y-12">
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
