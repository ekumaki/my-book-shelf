import Dexie, { type Table } from 'dexie';
import type { Book, Memo } from '../types';


export class BookKnowledgeDB extends Dexie {
    books!: Table<Book>;
    memos!: Table<Memo>;

    constructor() {
        super('BookKnowledgeDB');
        this.version(1).stores({
            books: 'id, title, authors, status, registeredAt, isbn',
            memos: 'id, bookId, tags, createdAt'
        });
    }
}

export const db = new BookKnowledgeDB();
