export type Maybe<K> = K | null | undefined

export declare const display: unique symbol;
export type Distinct<T, DistinctName> = T & { [ display ]: DistinctName };

