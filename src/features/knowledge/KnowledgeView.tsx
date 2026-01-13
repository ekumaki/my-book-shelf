import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { Memo, Book } from '../../types';
import { Hash, ArrowLeft } from '@phosphor-icons/react';

interface EnrichedMemo extends Memo {
    book?: Book;
}

import { useTheme } from '../../context/ThemeContext';

export default function KnowledgeView() {
    const { theme } = useTheme();
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Get all memos to aggregate tags
    const allMemos = useLiveQuery(() => db.memos.toArray()) || [];

    // Aggregate tags
    const tagCounts = allMemos.reduce((acc, memo) => {
        memo.tags.forEach(t => {
            acc[t] = (acc[t] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    // Detail view data
    const filteredMemos = useLiveQuery(async () => {
        if (!selectedTag) return [];
        const memos = await db.memos.toArray();
        const targetMemos = memos.filter(m => m.tags.includes(selectedTag));
        // Enrich with Book data
        const enriched = await Promise.all(targetMemos.map(async m => {
            const book = await db.books.get(m.bookId);
            return { ...m, book };
        }));
        return enriched as EnrichedMemo[];
    }, [selectedTag]);

    if (viewMode === 'detail' && selectedTag) {
        // Sort in render or query? Query returned promise so sorting there is better.
        // But useLiveQuery promise result is what we get.
        // Let's sort here if needed, or in the query function. I sorted in query.
        const sortedMemos = filteredMemos?.sort((a, b) => b.createdAt - a.createdAt);

        return (
            <div className={`h-full flex flex-col pt-0 transition-colors`}>
                <div className={`p-3 ${theme.bgColor} backdrop-blur-md shadow-md flex items-center gap-2 sticky top-0 z-10 transition-colors`}>
                    <button onClick={() => setViewMode('list')} className={`p-1 ${theme.textColor} hover:opacity-70`}><ArrowLeft size={20} /></button>
                    <h2 className={`font-bold text-lg ${theme.textColor}`}>{selectedTag}</h2>
                    <span className={`text-xs ${theme.subTextColor} ml-auto`}>{sortedMemos?.length || 0}件のナレッジ</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    {sortedMemos?.map((memo) => (
                        <div key={memo.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-50">
                                <div className="w-8 h-10 bg-gray-200 flex-shrink-0">
                                    {memo.book?.thumbnail && <img src={memo.book.thumbnail} className="w-full h-full object-cover" />}
                                </div>
                                <span className="text-xs font-bold text-gray-600 truncate flex-1">{memo.book?.title || '削除された本'}</span>
                                {memo.page && <span className="text-[10px] text-gray-400">P.{memo.page}</span>}
                            </div>

                            {memo.quote && (
                                <div className="text-sm italic text-gray-600 mb-2 pl-2 border-l-2 border-amber-300">
                                    {memo.quote}
                                </div>
                            )}
                            <div className="text-sm">{memo.comment}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col pt-0">
            <div className={`p-4 ${theme.bgColor} backdrop-blur-md shadow-md sticky top-0 z-10 text-center transition-colors`}>
                <h2 className={`font-bold text-lg flex items-center justify-center gap-2 ${theme.textColor}`}>
                    <Hash weight="bold" /> ナレッジタグ一覧
                </h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto flex-1 content-start">
                {!tags || tags.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-400 mt-10">
                        <p>タグがまだありません。</p>
                        <p className="text-xs mt-2">感想入力時に「#タグ」を追加してください。</p>
                    </div>
                ) : (
                    tags.map(([tag, count]) => (
                        <button
                            key={tag}
                            onClick={() => { setSelectedTag(tag); setViewMode('detail'); }}
                            className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                        >
                            <span className="font-bold text-gray-700 truncate mr-2">{tag}</span>
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full shrink-0">{count}</span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
