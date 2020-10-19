export declare abstract class Packet {
    private static registry;
    static register(id: number, classRef: new () => Packet): void;
    static decode(str: string): Packet;
    readonly id: number;
    protected readonly fields: Array<string>;
    constructor(id: number, fields: Array<string>);
    test(): void;
    protected abstract fromObj(obj: {
        [key: string]: any;
    }): Packet;
    abstract toString(): string;
    toJSON(): string;
    encode(): string;
    protected getInt(v: any): number;
    protected getFloat(v: any): number;
    protected getString(v: any): string;
    protected getArray<T>(v: any): Array<T>;
}
