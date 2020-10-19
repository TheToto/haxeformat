/// <reference types="node" />
export declare class Serializer {
    static USE_CACHE: boolean;
    static run(v: any): string;
    protected shash: Record<string, number>;
    protected scount: number;
    protected buf: string;
    protected cache: Array<any>;
    useCache: boolean;
    constructor();
    toString(): string;
    toBuffer(): Buffer;
    serialize(v: any): void;
    protected serializeString(s: string): void;
    protected serializeClass(v: any, className: string): void;
    protected serializeFields(v: {}): void;
    protected serializeRef(v: any): boolean;
}
