export interface TypeResolver {
    resolveClass: (name: string) => (new () => any);
}
export declare class Unserializer {
    protected static classRegister: Record<string, new () => any>;
    protected static initialized: boolean;
    protected static DefaultResolver: TypeResolver;
    static DEFAULT_RESOLVER: TypeResolver;
    /**
     * For security, classes will not be unserialized unless they
     * are registered as safe. Before unserializing, be sure to
     * register every class that could be in the serialized information.
     * ```
     * class Apple {}
     * let apple = new Apple();
     * Unserializer.register(Apple); // note the class name, not the instance
     * ```
     * @param clazz A class, not an instance or the string but the class name
     */
    static registerSerializableClass(clazz: new () => any): void;
    /**
     * Register internal classes that are safe to unserialize
     */
    protected static initialize(): void;
    protected buf: string;
    protected pos: number;
    protected length: number;
    protected cache: Array<any>;
    protected scache: Array<string>;
    /**
     * The class resolver for the unserializer.
     * Defaults to {@link UnserializerDEFAULT_RESOLVER}, but
     * this can be changed for the current instance
     */
    resolver: TypeResolver;
    constructor(s: string);
    protected isEof(c: number): boolean;
    protected unserializeObject(o: any): void;
    protected readDigits(): number;
    protected readFloat(): number;
    unserialize(): any;
}
