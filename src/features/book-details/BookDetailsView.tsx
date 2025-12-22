import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { BookStatus } from '../../types';

import { ArrowLeft, Trash, CheckCircle, CalendarCheck, Quotes, Plus } from '@phosphor-icons/react';
import MemoModal from './MemoModal';
import ImageModal from './ImageModal';
import clsx from 'clsx';

const STATUS_CONFIG: Record<BookStatus, { label: string; color: string; next: BookStatus }> = {
    unread: { label: '未読', color: 'bg-gray-200 text-gray-600', next: 'reading' },
    reading: { label: '読書中', color: 'bg-blue-100 text-blue-700', next: 'read' },
    read: { label: '読了', color: 'bg-green-100 text-green-700', next: 'unread' }
};

export default function BookDetailsView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    const book = useLiveQuery(() => db.books.get(id!), [id]);
    const memos = useLiveQuery(() => db.memos.where('bookId').equals(id!).reverse().sortBy('createdAt'), [id]);

    if (!book) return <div className="p-4 text-center">Loading...</div>;

    const cycleStatus = async () => {
        const currentStatus = book.status || 'unread';
        const nextStatus = STATUS_CONFIG[currentStatus].next;

        await db.books.update(book.id, {
            status: nextStatus
        });
    };

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        await db.books.update(book.id, { finishedDate: newDate });
    };

    const handleDelete = async () => {
        if (confirm('この本とすべてのメモを削除しますか？')) {
            await db.books.delete(book.id);
            await db.memos.where('bookId').equals(book.id).delete();
            navigate('/');
        }
    };

    const currentStatusConfig = STATUS_CONFIG[book.status];

    return (
        <div className="h-full flex flex-col bg-gray-50 pb-0 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b p-3 flex items-center gap-3 shadow-sm z-10 shrink-0">
                <button onClick={() => navigate(-1)} className="text-gray-600 p-1 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold truncate flex-1">{book.title}</h2>
                <button onClick={handleDelete} className="text-red-400 p-1 hover:text-red-600">
                    <Trash size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                {/* Book Info Header */}
                <div className="bg-white p-4 mb-4 shadow-sm flex gap-4">
                    <div className="w-24 flex-shrink-0 shadow-md cursor-zoom-in group relative" onClick={() => setShowImageModal(true)}>
                        {book.thumbnail ? (
                            <img src={book.thumbnail} className="w-full h-auto" />
                        ) : (
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-xs">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    <div className="flex-1 py-1">
                        <p className="text-sm text-gray-500 mb-2">{book.authors.join(', ')}</p>

                        <div className="flex flex-col items-start gap-3 mt-2">
                            <button
                                onClick={cycleStatus}
                                className={clsx("text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border transition-colors", currentStatusConfig.color, "border-current")}
                            >
                                <CheckCircle weight="fill" />
                                {currentStatusConfig.label}
                                <span className="text-[10px] opacity-60 ml-1">(タップで変更)</span>
                            </button>

                            <div className={clsx(
                                "flex items-center gap-2 p-2 rounded border w-full",
                                book.status === 'read' 
                                    ? "bg-gray-50 border-gray-200" 
                                    : "bg-gray-100 border-gray-300 opacity-60"
                            )}>
                                <CalendarCheck className={clsx(
                                    "text-sm",
                                    book.status === 'read' ? "text-gray-400" : "text-gray-400"
                                )} />
                                <div className="flex-1">
                                    <label className={clsx(
                                        "text-[10px] font-bold block",
                                        book.status === 'read' ? "text-gray-500" : "text-gray-400"
                                    )}>読了日</label>
                                    <input
                                        type="date"
                                        value={book.finishedDate || ''}
                                        onChange={handleDateChange}
                                        disabled={book.status !== 'read'}
                                        className={clsx(
                                            "bg-transparent text-sm w-full focus:outline-none font-medium",
                                            book.status === 'read' 
                                                ? "text-gray-700 cursor-pointer" 
                                                : "text-gray-400 cursor-not-allowed"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Memos List */}
                <div className="px-4">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="font-bold text-gray-700">ナレッジ・感想メモ ({memos?.length || 0})</h3>
                    </div>

                    {!memos || memos.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-sm">まだメモがありません</p>
                            <p className="text-xs mt-1">右下のボタンから追加できます</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {memos.map(memo => (
                                <div key={memo.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-wrap gap-1">
                                            {memo.tags.map(t => (
                                                <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        {memo.page && <span className="text-xs text-gray-400">P.{memo.page}</span>}
                                    </div>

                                    {memo.quote && (
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 italic mb-3 relative">
                                            <Quotes weight="fill" className="text-gray-300 absolute top-1 left-1" />
                                            <span className="relative z-10 pl-2 block">{memo.quote}</span>
                                        </div>
                                    )}

                                    {memo.comment && (
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{memo.comment}</p>
                                    )}
                                    <div className="mt-2 text-[10px] text-gray-400 text-right">
                                        {new Date(memo.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-20 right-[calc(50%-224px+16px)] sm:right-10 bg-amber-600 hover:bg-amber-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40 md:right-[calc(50%-200px)]"
                style={{ right: 'max(1rem, calc(50% - 208px))' }}
            >
                <Plus size={24} weight="bold" />
            </button>

            {showModal && (
                <MemoModal
                    bookId={book.id}
                    onClose={() => setShowModal(false)}
                    onSaved={() => setShowModal(false)}
                />
            )}

            {showImageModal && book.thumbnail && (
                <ImageModal src={book.thumbnail} onClose={() => setShowImageModal(false)} />
            )}
        </div>
    );
}
