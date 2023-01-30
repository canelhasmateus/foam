export declare const brand: unique symbol;


// Opt
export type Optional<T> = T | null | undefined

export function safely<K, V>( fn: Fn<K, V> ): Fn<Optional<K>, Optional<V>> {
	return ( k: Optional<K> ) => {
		if ( !k ) return null
		return fn( k )
	}
}

export function either<K, V>( o: Optional<K>, e: V ): K | V {
	if ( o ) {
		return o
	}
	return e
}

// Named
export type Fn<K, V> = ( k: K ) => V

export type Sourced<T> = { source: T }


// Complex
export type Active<K> = {
	[Property in keyof K]: () => K[Property]
}
export type From<Type, Key, Fallback> = Key extends keyof Type
										? Type[ Key ]
										: Fallback
