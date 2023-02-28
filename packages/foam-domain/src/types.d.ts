export declare const brand: unique symbol;
export type Result = {
    success: boolean;
};
export type Success<T> = {
    success: true;
} & T;
export type Failure<T> = {
    success: false;
} & T;
export type Optional<T> = T | null | undefined;
export declare function safely<K, V>(fn: Fn<K, V>): Fn<Optional<K>, Optional<V>>;
export declare function either<K, V>(o: Optional<K>, e: V): K | V;
export type Fn<K, V> = (k: K) => V;
export type Sourced<T> = {
    source: T;
};
export type Active<K> = {
    [Property in keyof K]: () => K[Property];
};
export type From<Type, Key, Fallback> = Key extends keyof Type ? Type[Key] : Fallback;
//# sourceMappingURL=types.d.ts.map