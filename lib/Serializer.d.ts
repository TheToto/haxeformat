/// <reference types="node" />
import { HaxeType } from "./HaxeType";
export declare class Serializer {
    static USE_CACHE: boolean;
    static USE_ENUM_INDEX: boolean;
    static run(v: any): string;
    protected shash: Record<string, number>;
    protected scount: number;
    protected buf: string;
    protected cache: Array<any>;
    useCache: boolean;
    useEnumIndex: boolean;
    constructor();
    toString(): string;
    toBuffer(): Buffer;
    serialize(v: any): void;
    protected detectHaxeType(v: any): HaxeType;
    protected serializeString(s: string): void;
    protected serializeDate(date: Date): string;
    protected serializeClass(v: any, className: string): void;
    protected serializeFields(v: {}, endChar?: string): void;
    protected serializeRef(v: any): boolean;
}
