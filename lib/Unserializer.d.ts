export interface TypeResolver {
    resolveClass: (name: string) => (new () => any);
}
export declare class Unserializer {
    protected static classRegister: Record<string, new () => any>;
    protected static initialized: boolean;
    protected static DefaultResolver: TypeResolver;
    static DEFAULT_RESOLVER: TypeResolver;
    static registerSerializableClass(clazz: new () => any): void;
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
    protected readDigits(): number;
    protected readFloat(): number;
    unserialize(): any;
}
