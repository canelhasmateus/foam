import { Distinct, Maybe } from "./global";

export type Event<K> = unknown;
export type Sync = Distinct<unknown, "Sync">;
export type Async = Distinct<unknown, "Async">;
export type Latency = Sync | Async

export type Topic<L extends Latency, K extends Event<any>> = any

export interface Trap<T extends Topic<Sync, Event<any>>> {
	adjust<K>( event: T extends Topic<Sync, K> ? K : never ): Maybe<Partial<K>>;
}

export interface Consumer<T extends Topic<Async, Event<any>>> {
	notify<K>( event: T extends Topic<Async, K> ? K : never ): void;
}

//


export interface MessageBus<T extends Topic<any, Event<any>>> {

	set( topic: T extends Topic<Sync, any> ? T : never, trap: Trap<T> ): any;

	disarm( pick: any ): void;

	subscribe( topic: T extends Topic<Async, any> ? T : never, consumer: Consumer<T> ): any;

	cancel( subscription: any ): void;
}

