import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { db } from '../../db/db';
import type { Memo } from '../../types';

interface MemoModalProps {
    bookId: string;
    onClose: () => void;
    onSaved: () => void;
}

export default function MemoModal({ bookId, onClose, onSaved }: MemoModalProps) {
    const [page, setPage] = useState('');
    const [quote, setQuote] = useState('');
    const [comment, setComment] = useState('');
    const [tagInput, setTagInput] = useState('');

    const handleSave = async () => {
        if (!quote && !comment) return alert('引用または感想を入力してください');

        const tags = tagInput.split(/[\s,、]+/).filter(t => t).map(t => t.startsWith('#') ? t : `#${t}`);

        const newMemo: Memo = {
            id: crypto.randomUUID(),
            bookId,
            page: page ? parseInt(page) : undefined,
            quote,
            comment,
            tags,
            createdAt: Date.now()
        };

        await db.memos.add(newMemo);
        onSaved();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full sm:w-96 max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl p-5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">メモを追加</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">ページ数 (任意)</label>
                        <input type="number" className="w-full bg-gray-50 border rounded p-2 text-sm" placeholder="123" value={page} onChange={e => setPage(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">気になった文章 (引用)</label>
                        <textarea className="w-full bg-gray-50 border rounded p-2 text-sm h-24" placeholder="本の文章をコピペ..." value={quote} onChange={e => setQuote(e.target.value)}></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">感想・メモ</label>
                        <textarea className="w-full bg-gray-50 border rounded p-2 text-sm h-24" placeholder="自分の考え..." value={comment} onChange={e => setComment(e.target.value)}></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">タグ (スペース区切り)</label>
                        <input type="text" className="w-full bg-gray-50 border rounded p-2 text-sm" placeholder="#お金 #投資" value={tagInput} onChange={e => setTagInput(e.target.value)} />
                    </div>

                    <button onClick={handleSave} className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold shadow hover:bg-amber-700">
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );
}
