export type BookStatus = 'unread' | 'reading' | 'read';

export interface Book {
    id: string; // UUID
    isbn: string;
    title: string;
    authors: string[];
    thumbnail?: string;
    status: BookStatus;
    registeredAt: number; // Unix Timestamp
    finishedDate?: string; // YYYY-MM-DD
}

export interface Memo {
    id: string; // UUID
    bookId: string;
    page?: number;
    quote?: string;
    comment?: string;
    tags: string[];
    createdAt: number; // Unix Timestamp
}

export type ThemeId = 'dark_wood' | 'light_wood';

export interface Theme {
    id: ThemeId;
    label: string;
    cssClass: string;
    textColor: string;
    subTextColor: string;
    borderColor: string;
    bgColor: string;
}
