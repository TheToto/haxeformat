/// <reference types="node" />
export declare class Serializer {
    /**
     * If the values you are serializing can contain circular references or
     * objects repetitions, you should set `USE_CACHE` to true to prevent
     * infinite loops.
     *
     * This may also reduce the size of serialization Strings at the expense of
     * performance.
     *
     * This value can be changed for individual instances of `Serializer` by
     * setting their `useCache` field.
     */
    static USE_CACHE: boolean;
    /**
     * Serializes `v` and returns the String representation.
     *
     * This is a convenience function for creating a new instance of
     * Serializer, serialize `v` into it and obtain the result through a call
     * to `toString()`.
     */
    static run(v: any): string;
    protected shash: Record<string, number>;
    protected scount: number;
    protected buf: string;
    protected cache: Array<any>;
    /**
     * The individual cache setting for 'this' Serializer instance.
     * See {@link USE_CACHE} for a complete description
     */
    useCache: boolean;
    constructor();
    /**
     * Return the String representation of this Serializer. This may
     * be called after any call to {@link serialize} without affecting
     * subsequent calls to {@link serialize}
     */
    toString(): string;
    /**
     * Returns the serialized data as a byte buffer.
     * @see toString
     */
    toBuffer(): Buffer;
    /**
     * Once you have created a serializer, just keep serializing things
     * by calling this method. At any point, you can call {@link toString}
     * to get the current encode buffer.
     * @param v Any value to serialize
     */
    serialize(v: any): void;
    protected serializeString(s: string): void;
    protected serializeClass(v: any, className: string): void;
    protected serializeFields(v: {}): void;
    protected serializeRef(v: any): boolean;
}
