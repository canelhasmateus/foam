export declare const brand: unique symbol;

export type Maybe<K> = K | null | undefined
export type Update<K> = Maybe<Partial<K>>
type Bag<T> = {
	[ _: string ]: T;
}
export type Opaque<T> = T & { [ brand ]: T }
