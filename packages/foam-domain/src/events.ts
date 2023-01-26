export declare const brand: unique symbol;
// Synchronous handling
type CorcernTopic<K> = { name: Symbol, [ brand ]: "Concern" }
type AnyConcern = CorcernTopic<any>
type Content<K> = K extends CorcernTopic<infer X> ? Readonly<X> : never
export type Advice<K> = ( event: K ) => Partial<K> | null | undefined;
type Link = {
	id: symbol;
	concern: AnyConcern;
	advice: Advice<any>;
}

class Intercept<T extends AnyConcern> {

	private links: Map<AnyConcern, Link[]>;

	constructor() {
		this.links = new Map();
	}


	add<S extends T>( concern: S, advice: Advice<Content<S>> ): Link {
		const link: Link = {
			id:      Symbol(),
			concern: concern,
			advice:  advice
		}

		const links = this.links.get( concern );
		links ? links.push( link )
			  : this.links.set( concern, [ link ] );

		return link;
	}

	inspect<S extends T>( concern: S, content: Content<S> ): Content<T> {
		let result  = Object.assign( {}, content )
		const links = this.links.get( concern ) || []
		for ( const { advice } of links ) {
			const update = advice( result )
			if ( update ) {
				Object.assign( result, update )
			}
		}

		return result
	};

	remove( link: Link ): void {
		const { concern } = link
		const consumers   = this.links.get( concern ) || [];
		this.links.set( concern, consumers.filter( el => {
			return el.id !== link.id;
		} ) )
	};

}

class ModifiedIntercept<T extends AnyConcern> {

	private links: Map<AnyConcern, Link[]>;

	constructor() {
		this.links = new Map();
	}


	add<S extends T>( concern: S, advice: Advice<Content<S>> ): Link {
		const link: Link = {
			id:      Symbol(),
			concern: concern,
			advice:  advice
		}

		const links = this.links.get( concern );
		links ? links.push( link )
			  : this.links.set( concern, [ link ] );

		return link;
	}

	inspect<S extends T>( concern: S, content: Content<S> ): Content<T> {
		let result  = Object.assign( {}, content )
		const links = this.links.get( concern ) || []
		for ( const link of links ) {
			const update = link.advice( result )
			if ( update ) {
				result = { ...result, ...update }
			}
		}
		return result
	};

	remove( link: Link ): void {
		const { concern } = link
		const consumers   = this.links.get( concern ) || [];
		this.links.set( concern, consumers.filter( el => {
			return el.id !== link.id;
		} ) )
	};

}


// Asynchronous handling
type MessageTopic<K> = { name: Symbol, [ brand ]: "Topic" }
type AnyTopic = MessageTopic<any>
type Payload<T> = T extends MessageTopic<infer X> ? Readonly<X> : never;
type Consumer<K> = ( e: K ) => void
type Subscription = {
	id: symbol; topic: AnyTopic; subscribed: Consumer<any>;
}

class MessageBus<T extends AnyTopic> {

	private subscriptions: Map<AnyTopic, Subscription[]>;

	constructor() {
		this.subscriptions = new Map();
	}

	subscribe<S extends T>( topic: S, consumer: Consumer<Payload<S>> ): Subscription {
		const subscription: Subscription = {
			id:         Symbol(),
			topic:      topic,
			subscribed: consumer
		}

		const subscribers = this.subscriptions.get( topic );
		subscribers ? subscribers.push( subscription )
					: this.subscriptions.set( topic, [ subscription ] );

		return subscription;
	}

	publish<S extends T>( topic: S, message: Payload<S> ): Promise<void> {
		return new Promise( () => {
			const subscribers = this.subscriptions.get( topic ) || []
			for ( const { subscribed } of subscribers ) {
				subscribed( message )
			}
		} )
	}

	cancel( subscription: Subscription ): void {
		const { topic } = subscription
		const consumers = this.subscriptions.get( topic ) || [];
		this.subscriptions.set( topic, consumers.filter( el => {
			return el.id !== subscription.id;
		} ) );
	}

}

//

type Bag<T> = T[keyof T] extends infer K ? K : never


export function createMessageTopic<K>(): MessageTopic<K> {
	return { name: Symbol() } as unknown as MessageTopic<K>
}

export function createConcernTopic<K>(): CorcernTopic<K> {
	return { name: Symbol() } as unknown as CorcernTopic<K>
}

export function createBus<T extends { [ _: string ]: AnyTopic }>( topics: T ): MessageBus<T[keyof T]> {
	return new MessageBus();
}

export function createIntercept<T extends { [ _: string ]: AnyConcern }>( concerns: T ): Intercept<T[keyof T]> {
	return new Intercept();
}

export function createInterceptModified<T extends { [ _: string ]: AnyConcern }>( concerns: T ): ModifiedIntercept<T[keyof T]> {
	return new ModifiedIntercept();
}

