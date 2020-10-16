export declare abstract class Packet {
    private static registry;
    /**
     * Must be called by all pakect types after the class definition
     * @param id The packet id must be unique for each packet class
     * @param classRef the class constructor. Usually just the name of the class
     */
    static register(id: number, classRef: new () => Packet): void;
    /**
     * Calling this method will deserialize a acpket, creating a new instance
     * of any class that is a subclass of and registered with Packet
     * @param str Serialized packet data
     */
    static decode(str: string): Packet;
    readonly id: number;
    protected readonly fields: Array<string>;
    constructor(id: number, fields: Array<string>);
    /**
     * Test that the fields all exist
     */
    test(): void;
    /**
     * Packet.decode will call this method with an object after unserializing
     * the data. The fields are guaranteed to only be the fields passed in
     * during the constructor. You should use methods like {@link getInt}
     * or {@link getString} to ensure the unserialized data is the correct type.
     *
     * @param obj Object with keys and values
     * @returns The packet should return itself for chaining
     */
    protected abstract fromObj(obj: {
        [key: string]: any;
    }): Packet;
    /**
     * All packets must implement a toString, which is useful for debugging.
     * @returns Arbitray string value representing the packet
     */
    abstract toString(): string;
    /**
     * Returns a json version of this packet
     */
    toJSON(): string;
    /**
     * Serialize this packet.
     * This method does not have to be overridden by subclasses.
     *
     * @returns Packet serialized
     */
    encode(): string;
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully a number from the serialized data
     * @returns Math.floor of number
     * @throws Error if value not a number
     */
    protected getInt(v: any): number;
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully a number from the serialized data
     * @returns A number
     * @throws Error if value not a number
     */
    protected getFloat(v: any): number;
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully a string from the serialized data
     * @returns String value
     * @throws Error if value not a string
     */
    protected getString(v: any): string;
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully an Array from the serialized data
     * @returns Typed array
     * @throws Error if value not an Array
     */
    protected getArray<T>(v: any): Array<T>;
}
