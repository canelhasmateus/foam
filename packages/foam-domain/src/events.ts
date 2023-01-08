import { Maybe, } from "./global";

declare const brand: unique symbol;
export type Sync = { [ brand ]: "Sync" }
export type Async = { [ brand ]: "Async" }

export type Topic<Name, K, C extends Sync | Async> = {
	name: symbol;
}

export function createTopic<Name, K, C extends Sync | Async>(): Topic<Name, K, C> {
	return {
		name: Symbol()
	}
}

export type SyncTopic<K> = Topic<any, K, Sync>;
export type AsyncTopic<K> = Topic<any, K, Async>;
type AnySyncTopic = SyncTopic<any>;
type AnyAsyncTopic = AsyncTopic<any>;


// Synchronous handling
export type Adjustment<K> = ( event: K ) => Maybe<Partial<K>>;

export interface Trap<T> {
	id: symbol;
	adjust: Adjustment<T>;

}

export function createTrap<K>( fn: Adjustment<K> ): Trap<K> {
	return {
		id:     Symbol(),
		adjust: fn
	}
}

// Asynchronous handling
type BlackHole<K> = ( e: K ) => void;

export interface Consumer<K> {
	id: symbol;
	notify: BlackHole<K>;
}


export function createConsumer<K>( fn: BlackHole<K> ): Consumer<K> {
	return {
		id:     Symbol(),
		notify: fn
	}
}

// Messaging
export type TrapHandle = {
	[ brand ]: "TrapHandle";
}

export interface Interrupt<T extends AnySyncTopic> {

	setup<K>( topic: T, trap: Trap<K> ): T extends SyncTopic<K> ? TrapHandle : never;

	trigger<K>( topic: T, message: K ): T extends SyncTopic<K> ? K : never;

	disarm( pick: TrapHandle ): void;
}

//
export type Subscription = {
	[ brand ]: "Subscription";
}

export interface MessageBus<T extends AnyAsyncTopic> {
	subscribe<S extends AsyncTopic<K> & T, K>( topic: S, consumer: Consumer<K> ): Subscription;

	publish<K>( topic: T, message: K ): T extends AsyncTopic<K> ? void : never;

	cancel( subscription: Subscription ): void;
}

