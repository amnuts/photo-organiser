export namespace main {
	
	export class ExampleSubstitution {
	    path: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new ExampleSubstitution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.description = source["description"];
	    }
	}
	export class GeoLocationMetadata {
	    hash: string;
	    latitude: number;
	    longitude: number;
	    country: string;
	    division: string;
	    city: string;
	    place: string;
	
	    static createFrom(source: any = {}) {
	        return new GeoLocationMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hash = source["hash"];
	        this.latitude = source["latitude"];
	        this.longitude = source["longitude"];
	        this.country = source["country"];
	        this.division = source["division"];
	        this.city = source["city"];
	        this.place = source["place"];
	    }
	}
	export class ImageMetadata {
	    file_size: number;
	    filepath: string;
	    width: number;
	    height: number;
	    year: string;
	    year_taken: string;
	    year_created: string;
	    month: string;
	    month_taken: string;
	    month_created: string;
	    date: string;
	    date_taken: string;
	    date_created: string;
	    parent: string;
	    parent_if_not_date: string;
	    location: GeoLocationMetadata;
	
	    static createFrom(source: any = {}) {
	        return new ImageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.file_size = source["file_size"];
	        this.filepath = source["filepath"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.year = source["year"];
	        this.year_taken = source["year_taken"];
	        this.year_created = source["year_created"];
	        this.month = source["month"];
	        this.month_taken = source["month_taken"];
	        this.month_created = source["month_created"];
	        this.date = source["date"];
	        this.date_taken = source["date_taken"];
	        this.date_created = source["date_created"];
	        this.parent = source["parent"];
	        this.parent_if_not_date = source["parent_if_not_date"];
	        this.location = this.convertValues(source["location"], GeoLocationMetadata);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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

