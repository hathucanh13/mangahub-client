export namespace models {
	
	export class Manga {
	    id: string;
	    title: string;
	    author: string;
	    artist: string;
	    genres: string[];
	    chapter_count: number;
	    published_year: number;
	    status: string;
	    cover_url: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new Manga(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.author = source["author"];
	        this.artist = source["artist"];
	        this.genres = source["genres"];
	        this.chapter_count = source["chapter_count"];
	        this.published_year = source["published_year"];
	        this.status = source["status"];
	        this.cover_url = source["cover_url"];
	        this.description = source["description"];
	    }
	}
	export class PaginatedMangasResponse {
	    page: number;
	    page_size: number;
	    total_pages: number;
	    total_items: number;
	    items: Manga[];
	
	    static createFrom(source: any = {}) {
	        return new PaginatedMangasResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.page_size = source["page_size"];
	        this.total_pages = source["total_pages"];
	        this.total_items = source["total_items"];
	        this.items = this.convertValues(source["items"], Manga);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ReadingEntry {
	    manga_id: string;
	    current_chapter: number;
	    volume?: number;
	    notes?: string;
	    status: string;
	    // Go type: time
	    last_updated: any;
	
	    static createFrom(source: any = {}) {
	        return new ReadingEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.manga_id = source["manga_id"];
	        this.current_chapter = source["current_chapter"];
	        this.volume = source["volume"];
	        this.notes = source["notes"];
	        this.status = source["status"];
	        this.last_updated = this.convertValues(source["last_updated"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ReadingLists {
	    reading: ReadingEntry[];
	    completed: ReadingEntry[];
	    plan_to_read: ReadingEntry[];
	
	    static createFrom(source: any = {}) {
	        return new ReadingLists(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.reading = this.convertValues(source["reading"], ReadingEntry);
	        this.completed = this.convertValues(source["completed"], ReadingEntry);
	        this.plan_to_read = this.convertValues(source["plan_to_read"], ReadingEntry);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace services {
	
	export class ProgressHistoryItem {
	    manga_id: string;
	    chapter: number;
	    date_read: string;
	
	    static createFrom(source: any = {}) {
	        return new ProgressHistoryItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.manga_id = source["manga_id"];
	        this.chapter = source["chapter"];
	        this.date_read = source["date_read"];
	    }
	}
	export class ProgressHistory {
	    user_id: number;
	    history: ProgressHistoryItem[];
	
	    static createFrom(source: any = {}) {
	        return new ProgressHistory(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user_id = source["user_id"];
	        this.history = this.convertValues(source["history"], ProgressHistoryItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ProgressUpdateResponse {
	    manga_title: string;
	    previous_chapter: number;
	    current_chapter: number;
	    // Go type: time
	    updated_at: any;
	    devices_synced: number;
	    total_chapters_read: number;
	    reading_streak: number;
	    next_chapter: number;
	
	    static createFrom(source: any = {}) {
	        return new ProgressUpdateResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.manga_title = source["manga_title"];
	        this.previous_chapter = source["previous_chapter"];
	        this.current_chapter = source["current_chapter"];
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.devices_synced = source["devices_synced"];
	        this.total_chapters_read = source["total_chapters_read"];
	        this.reading_streak = source["reading_streak"];
	        this.next_chapter = source["next_chapter"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SearchResult {
	    results: any[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new SearchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.results = source["results"];
	        this.total = source["total"];
	    }
	}

}

