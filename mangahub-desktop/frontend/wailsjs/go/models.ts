export namespace models {
	
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

