import { HaxeEnum } from "./HaxeEnum";
export declare type TypeHint = "List" | "StringMap" | "IntMap" | "ObjectMap" | string;
export interface TypeResolver {
    resolveClass: (name: string) => (new () => any) | undefined | null;
    resolveEnum: (name: string) => typeof HaxeEnum | undefined | null;
}
export declare class Unserializer {
    protected static classRegister: Record<string, new () => any>;
    protected static enumRegister: Record<string, typeof HaxeEnum>;
    protected static initialized: boolean;
    protected static DefaultResolver: TypeResolver;
    static DEFAULT_RESOLVER: TypeResolver;
    static registerSerializableClass(clazz: new () => any): void;
    static registerSerializableEnum(enumz: typeof HaxeEnum): void;
    protected static initialize(): void;
    protected buf: string;
    protected pos: number;
    protected length: number;
    protected cache: Array<any>;
    protected scache: Array<string>;
    resolver: TypeResolver;
    allowUnregistered: boolean;
    addTypeHints: boolean;
    constructor(s: string);
    protected isEof(c: number): boolean;
    protected unserializeObject(o: any): void;
    protected unserializeEnum(edecl: typeof HaxeEnum | undefined | null, tag: string | number, ename: string): HaxeEnum;
    protected readDigits(): number;
    protected readFloat(): number;
    unserialize(): any;
}
