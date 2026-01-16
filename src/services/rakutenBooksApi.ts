const RAKUTEN_APP_ID = import.meta.env.VITE_RAKUTEN_APP_ID;

export interface RakutenBookItem {
    title: string;
    titleKana: string;
    subTitle: string;
    subTitleKana: string;
    seriesName: string;
    seriesNameKana: string;
    contents: string;
    contentsKana: string;
    author: string;
    authorKana: string;
    publisherName: string;
    size: string;
    isbn: string;
    itemCaption: string;
    salesDate: string;
    itemPrice: number;
    listPrice: number;
    discountRate: number;
    discountPrice: number;
    itemUrl: string;
    affiliateUrl: string;
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    chirayomiUrl: string;
    availability: string;
    postageFlag: number;
    limitedFlag: number;
    reviewCount: number;
    reviewAverage: string;
    booksGenreId: string;
}

// Helper to execute fetch
const fetchRakutenApi = async (paramKey: string, paramValue: string): Promise<RakutenBookItem[]> => {
    const url = 'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404';
    const params = new URLSearchParams();
    params.append('applicationId', RAKUTEN_APP_ID!);
    params.append(paramKey, paramValue);
    params.append('outOfStockFlag', '1');
    params.append('formatVersion', '2');
    params.append('hits', '30');

    const res = await fetch(`${url}?${params.toString()}`);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log(`Rakuten API Response (${paramKey}):`, data);

    // Handle both 'items' and 'Items' (API sometimes returns PascalCase or lowercase depending on conditions)
    return (data.Items || data.items || []) as RakutenBookItem[];
};

export const searchBooks = async (query: string): Promise<RakutenBookItem[]> => {
    if (!RAKUTEN_APP_ID) {
        console.warn('VITE_RAKUTEN_APP_ID is not set in .env file.');
        return [];
    }

    try {
        // 1. Check if query looks like an ISBN (10 or 13 digits, allowing hyphens)
        const cleanQuery = query.replace(/-/g, '');
        const isIsbn = /^\d{10}$|^\d{13}$/.test(cleanQuery);

        if (isIsbn) {
            return await fetchRakutenApi('isbn', cleanQuery);
        }

        // 2. If not ISBN, search by Title AND Author in parallel
        // This mimics the "keyword" search experience
        const [titleResults, authorResults] = await Promise.all([
            fetchRakutenApi('title', query).catch(e => {
                console.warn('Title search failed', e);
                return [];
            }),
            fetchRakutenApi('author', query).catch(e => {
                console.warn('Author search failed', e);
                return [];
            })
        ]);

        // Merge and deduplicate based on ISBN
        const allItems = [...titleResults, ...authorResults];
        const uniqueMap = new Map();
        allItems.forEach(item => {
            // Use ISBN as key for deduplication. Fallback to title if no ISBN (unlikely for books)
            const key = item.isbn || item.title;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            }
        });

        return Array.from(uniqueMap.values());

    } catch (error) {
        console.error('Rakuten Books API search failed:', error);
        throw error;
    }
};
