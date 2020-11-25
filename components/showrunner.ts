export class Client {
    conferences: conferences.ServiceClient;

    constructor(environment: string) {
        const base = new BaseClient(environment)
        this.conferences = new conferences.ServiceClient(base)
    }
}

export namespace conferences {
    export interface Conference {
        ID: number;
        Name: string;
        Slug: string;
        StartDate: string;
        EndDate: string;
        Venue: Venue;
        Slots: ConferenceSlot[];
    }

    export interface Venue {
        ID: number;
        Name: string;
        Description: string;
        Address: string;
        Directions: string;
        GoogleMapsURL: string;
        Capacity: number;
    }

    export interface GetConferenceSlotsResponse {
        ConferenceSlots: ConferenceSlot[];
    }

    export interface Location {
        ID: number;
        Name: string;
        Description: string;
        Address: string;
        Directions: string;
        GoogleMapsURL: string;
        Capacity: number;
        VenueID: number;
    }

    export interface GetAllParams {
    }

    export interface Event {
        ID: number;
        Name: string;
        Slug: string;
        Conferences: Conference[];
    }

    export interface GetConferenceSlotsParams {
        ConferenceID: number;
    }

    export interface ConferenceSlot {
        ID: number;
        Name: string;
        Description: string;
        Cost: number;
        Capacity: number;
        StartDate: string;
        EndDate: string;

        /**
         * DependsOn means that these two Slots need to be acquired together, user must either buy
         * both Slots or pre-own one of the one it depends on.
         * DependsOn *ConferenceSlot // Currently removed as it broke encore
         * PurchaseableFrom indicates when this item is on sale, for instance early bird tickets are the first
         * ones to go on sale.
         */
        PurchaseableFrom: string;

        /**
         * PuchaseableUntil indicates when this item stops being on sale, for instance early bird tickets can
         * no loger be purchased N months before event.
         */
        PurchaseableUntil: string;

        /**
         * AvailableToPublic indicates is this is something that will appear on the tickets purchase page (ie, we can
         * issue sponsor tickets and those cannot be bought individually)
         */
        AvailableToPublic: boolean;
        Location: Location;
    }

    export interface GetAllResponse {
        Events: Event[];
    }

    export class ServiceClient {
        private baseClient: BaseClient;

        constructor(baseClient: BaseClient) {
            this.baseClient = baseClient
        }

        /**
         * GetConferenceSlots retrieves all event slots for a specific event id
         */
        public GetConferenceSlots(params: GetConferenceSlotsParams): Promise<GetConferenceSlotsResponse> {
            return this.baseClient.do<GetConferenceSlotsResponse>("conferences.GetConferenceSlots", params);
        }

        /**
         * GetAll retrieves all conferences and events
         */
        public GetAll(params: GetAllParams): Promise<GetAllResponse> {
            return this.baseClient.do<GetAllResponse>("conferences.GetAll", params);
        }
    }
}

class BaseClient {
    baseURL: string;

    constructor(environment: string) {
		if (environment === "dev") {
			this.baseURL = "http://localhost:4060/"
		} else {
			this.baseURL = `https://showrunner-46b2.encoreapi.com/${environment}/`
		}
    }

    public async do<T>(endpoint: string, req?: any): Promise<T> {
        let response = await fetch(this.baseURL + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req || {})
        })
        if (!response.ok) {
            let body = await response.text()
            throw new Error("request failed: " + body)
        }
        return <T>(await response.json())
    }

    public async doVoid(endpoint: string, req?: any): Promise<void> {
        let response = await fetch(this.baseURL + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req || {})
        })
        if (!response.ok) {
            let body = await response.text()
            throw new Error("request failed: " + body)
        }
        await response.text()
    }
}

const client = new Client("production")
export default client
