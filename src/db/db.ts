import Dexie, { type Table } from 'dexie';
import type { Book, Memo, Shelf } from '../types';


export class MyShocoDB extends Dexie {
    books!: Table<Book>;
    memos!: Table<Memo>;
    shelves!: Table<Shelf>;

    constructor() {
        super('MyShocoDB');
        this.version(1).stores({
            books: 'id, title, authors, status, registeredAt, isbn',
            memos: 'id, bookId, tags, createdAt'
        });
        this.version(2).stores({
            books: 'id, title, authors, status, registeredAt, isbn',
            memos: 'id, bookId, tags, createdAt',
            shelves: 'id, title, createdAt'
        });
    }
}

export const db = new MyShocoDB();
