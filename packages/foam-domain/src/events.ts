import { Bag, brand, Update, } from "./global";


export type Sync = { [ brand ]: "Sync" }
type Trap<K> = ( event: K ) => Update<K>;
type AnyTrap = Trap<any>

export type Async = { [ brand ]: "Async" }
type Consumer<K> = ( e: K ) => void
type AnyConsumer = Consumer<any>


type Topic<K, C extends Sync | Async> = {
	name: symbol;
}
type AnyTopic = Topic<any, any>

export function createTopic<K, C extends Sync | Async>( name = "" ): Topic<K, C> {
	return {
		name: Symbol( name )
	} as Topic<K, C>
}

export type Payload<T> = T extends Topic<infer X, any> ? X : never;
// Synchronous handling

type TrapHandle = {
	[ brand ]: "TrapHandle";
}

type Trapable = Topic<any, Sync>

interface Interrupt<T extends Trapable> {

	setup<S extends T>( topic: T, trap: Trap<T> ): TrapHandle;

	trigger<S extends T>( topic: T, message: Payload<T> ): Payload<T>;

	disarm( pick: TrapHandle ): void;
}

// Asynchronous handling
type Subscription = [ AnyTopic, symbol, AnyConsumer ]
type Consumable = Topic<any, Async>

class MessageBus<T extends Consumable> {

	//todo better bus
	private consumers: Map<symbol, Subscription[]>;

	constructor() {
		this.consumers = new Map();
	}

	subscribe<S extends T>( topic: S, consumer: Consumer<Payload<S>> ): Subscription {
		const subscription: Subscription = [ topic, Symbol(), consumer ]

		const subscribers = this.consumers.get( topic.name );
		const _           = subscribers
							? subscribers.push( subscription )
							: this.consumers.set( topic.name, [ subscription ] )

		return subscription;
	}

	publish<S extends T>( topic: S, message: Payload<S> ): Promise<void> {
		return new Promise( () => {
			const subscribed = this.consumers.get( topic.name ) || []
			for ( const [ __, _, consumer ] of subscribed ) {
				consumer( message )
			}
		} )
	}

	cancel( subscription: Subscription ): void {
		const [ topic, _, __ ] = subscription
		const consumers        = this.consumers.get( topic.name ) || [];
		this.consumers.set( topic.name, consumers.filter( ( s ) => {
			return s === subscription;
		} ) );
	}

}


export function createBus<T extends Bag<Consumable>>( topics: T ): MessageBus<T[keyof T]> {
	return new MessageBus();
}

