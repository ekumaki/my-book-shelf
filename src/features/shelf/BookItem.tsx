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
            className="cursor-pointer flex flex-col items-center w-[25%] sm:w-[20%] md:w-[120px] px-1 sm:px-2 mb-0 relative group book-spine shrink-0"
        >
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-sm overflow-hidden shadow-md relative">
                {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 p-2 text-center text-xs font-bold break-words">
                        <span className="line-clamp-3">{book.title}</span>
                    </div>
                )}

                {/* Status Badge */}
                {book.status === 'read' && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-bl shadow font-bold">読了</div>
                )}
                {book.status === 'reading' && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded-bl shadow font-bold">読中</div>
                )}
            </div>
        </div>
    );
}
