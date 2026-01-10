import type { Book } from '../../types';

import { useNavigate } from 'react-router-dom';

interface BookItemProps {
    book: Book;
}

export default function BookItem({ book }: BookItemProps) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/book/${book.id}`)}
            className="cursor-pointer flex flex-col items-center w-[33.333%] px-1 sm:px-2 mb-0 relative group book-spine shrink-0"
        >
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-sm overflow-hidden shadow-md relative">
                {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 p-2 text-center text-xs font-bold break-words">
                        <span className="line-clamp-3">{book.title}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
