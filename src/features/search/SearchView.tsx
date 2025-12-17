import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/db';
import { Spinner, CheckCircle, Plus } from '@phosphor-icons/react';
import type { Book } from '../../types';

// Loose type for Google Books API response
interface GoogleBookItem {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: { thumbnail: string };
        industryIdentifiers?: { type: string; identifier: string }[];
    };
}

export default function SearchView() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GoogleBookItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [existingIsbns, setExistingIsbns] = useState<Set<string>>(new Set());
    const resultsContainerRef = useRef<HTMLDivElement | null>(null);

    // Load existing ISBNs to check duplicates
    useEffect(() => {
        db.books.toArray().then(books => {
            setExistingIsbns(new Set(books.map(b => b.isbn).filter(Boolean)));
        });
    }, []);

    const searchBooks = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query) return;
        setLoading(true);
        // Reset scroll so results are shown from the top on every search
        resultsContainerRef.current?.scrollTo({ top: 0 });
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
            const data = await res.json();
            if (data.items) {
                setResults(data.items);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error(error);
            alert('検索に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Also reset when results change (e.g., hot reload / async updates)
        resultsContainerRef.current?.scrollTo({ top: 0 });
    }, [results.length]);

    const handleAdd = async (item: GoogleBookItem) => {
        const info = item.volumeInfo;
        const isbn13 = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
        const isbn10 = info.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;
        const isbn = isbn13 || isbn10 || info.industryIdentifiers?.[0]?.identifier || '';

        const newBook: Book = {
            id: crypto.randomUUID(),
            title: info.title,
            authors: info.authors || ['不明'],
            thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
            isbn: isbn,
            status: 'unread',
            registeredAt: Date.now(),
            finishedDate: undefined
        };

        await db.books.add(newBook);
        setExistingIsbns(prev => new Set(prev).add(isbn));
    };

    return (
        <div className="h-full min-h-0 flex flex-col bg-gray-50 overflow-hidden">
            <div className="bg-white p-4 shadow-sm z-10 flex-shrink-0">
                <form onSubmit={searchBooks} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="タイトル、著者、ISBN..."
                        className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button type="submit" disabled={loading} className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm min-w-[60px] flex justify-center items-center">
                        {loading ? <Spinner className="animate-spin" size={20} /> : '検索'}
                    </button>
                </form>
            </div>

            <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-4 pb-20 min-h-0 overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map(item => {
                        const info = item.volumeInfo;
                        const isbn13 = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
                        const isbn = isbn13 || info.industryIdentifiers?.[0]?.identifier;
                        const isRegistered = isbn ? existingIsbns.has(isbn) : false;

                        return (
                            <div key={item.id} className="bg-white p-3 rounded-lg shadow flex gap-3">
                                <div className="w-16 h-24 flex-shrink-0 bg-gray-200">
                                    {info.imageLinks?.thumbnail && (
                                        <img src={info.imageLinks.thumbnail.replace('http:', 'https:')} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-sm line-clamp-2" title={info.title}>{info.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{info.authors?.join(', ')}</p>
                                    <div className="mt-auto">
                                        {isRegistered ? (
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                <CheckCircle weight="fill" /> 登録済み
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleAdd(item)}
                                                className="bg-amber-100 text-amber-800 px-3 py-1 rounded text-xs font-bold hover:bg-amber-200 w-full flex items-center justify-center gap-1"
                                            >
                                                <Plus weight="bold" /> 本棚に追加
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
