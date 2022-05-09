import { HaxeEnum } from "./HaxeEnum";
export interface TypeResolver {
    resolveClass: (name: string) => (new () => any);
    resolveEnum: (name: string) => typeof HaxeEnum;
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
    constructor(s: string);
    protected isEof(c: number): boolean;
    protected unserializeObject(o: any): void;
    protected unserializeEnum(edecl: typeof HaxeEnum, tag: string | number): any;
    protected readDigits(): number;
    protected readFloat(): number;
    unserialize(): any;
}
