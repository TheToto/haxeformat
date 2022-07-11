import {Buffer} from 'buffer'
import {HaxeEnum} from "./HaxeEnum";
import {HaxeException} from "./HaxeException";
import {type} from "os";

export type TypeHint = "List" | "StringMap" | "IntMap" | "ObjectMap" | string

export interface TypeResolver {
    resolveClass: (name: string) => (new () => any) | undefined | null
    resolveEnum: (name: string) => typeof HaxeEnum | undefined | null
}

function addTypeHint(value: any, type: TypeHint) {
    Object.defineProperty(value, "___type", {
        enumerable: false,
        value: type
    })
}

export class Unserializer {
    protected static classRegister: Record<string, new () => any> = {}
    protected static enumRegister: Record<string, typeof HaxeEnum> = {}
    protected static initialized: boolean = false;
    protected static DefaultResolver: TypeResolver = {
        resolveClass: (name) => {
            return Unserializer.classRegister[name];
        },
        resolveEnum: (name) => {
            return Unserializer.enumRegister[name];
        }
    }

    public static DEFAULT_RESOLVER: TypeResolver = Unserializer.DefaultResolver;

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
    public static registerSerializableClass(clazz: new () => any) {
        let name = clazz.name;
        if (name === undefined || name === null)
            throw new Error("Unable to get class name");
        if (name === "undefined" || name === "null" || name === "")
            throw new Error("Unable to register that as a serializable class");
        Unserializer.classRegister[name] = clazz;
    }

    public static registerSerializableEnum(enumz: typeof HaxeEnum) {
        let name = enumz.enum;
        if (name === undefined || name === null)
            throw new Error("Unable to get enum name");
        if (name === "undefined" || name === "null" || name === "")
            throw new Error("Unable to register that as a serializable enum");
        Unserializer.enumRegister[name] = enumz;
    }

    /**
     * Register internal classes that are safe to unserialize
     */
    protected static initialize() {
        if (Unserializer.initialized) return;

        // todo: add any internal classes here

        Unserializer.initialized = true;
    }

    protected buf: string = "";
    protected pos: number = 0;
    protected length: number = 0;

    protected cache: Array<any> = [];
    protected scache: Array<string> = [];
    /**
     * The class resolver for the unserializer.
     * Defaults to {@link UnserializerDEFAULT_RESOLVER}, but
     * this can be changed for the current instance
     */
    public resolver: TypeResolver;
    public allowUnregistered: boolean;
    public addTypeHints: boolean

    constructor(s: string) {
        Unserializer.initialize();
        this.buf = s;
        this.length = s.length;
        this.resolver = Unserializer.DEFAULT_RESOLVER;
        this.allowUnregistered = false;
        this.addTypeHints = true;
    }

    protected isEof(c: number): boolean {
        return c !== c; // fast NaN
    }

    protected unserializeObject(o: any) {
        while (true) {
            if (this.pos >= this.length) {
                throw new Error("Invalid object");
            }
            if (this.buf.charCodeAt(this.pos) == 103) {
                break;
            }
            let k = this.unserialize();
            if (typeof (k) != "string") {
                throw new Error("Invalid object key");
            }
            let v = this.unserialize();
            o[k] = v;
        }
        this.pos++;
    }

    protected unserializeEnum(edecl: typeof HaxeEnum | undefined | null, tag: string | number, ename: string): any {
        this.pos++; /* skip ':' */
        let constructs = edecl?.getEnumConstructs() ?? [];

        let enumClass;
        if (typeof tag == "number") {
            enumClass = constructs[tag];
        } else {
            enumClass = constructs.find((e: typeof HaxeEnum) => e.tag === tag);
        }
        if (!enumClass && !this.allowUnregistered)
            throw new Error("Unknown enum index/name : " + tag);
        let numArgs = this.readDigits();
        let args = Array(numArgs).fill(0).map(_ => this.unserialize());
        if (enumClass) {
            // @ts-ignore
            return new enumClass(...args);
        } else {
            // If enum is not registered, craft the enum. A bit dirty though.
            const genericEnum = Object.create(HaxeEnum.prototype);
            Object.defineProperty(genericEnum.constructor, 'enum', {
                get: () => ename
            });
            Object.defineProperty(genericEnum.constructor, 'tag', {
                get: () => tag
            });
            Object.defineProperty(genericEnum.constructor, 'tag', {
                get: () => tag
            });
            Object.defineProperty(genericEnum.constructor, 'getEnumConstructs', {
                value: () => {
                    if (typeof tag === "number") {
                        const c = new Array(tag + 1).fill({});
                        c[tag] = {tag};
                        return c
                    }
                    return []
                }
            });
            genericEnum["getParams"] = () => args
            genericEnum["args"] = args
            return genericEnum
        }
    }

    protected readDigits(): number {
        let k = 0;
        let s = false;
        let fpos = this.pos;
        let get = this.buf.charCodeAt.bind(this.buf);
        while (true) {
            let c: number = get(this.pos);
            if (this.isEof(c))
                break;
            if (c === 45 /*"-"*/) {
                if (this.pos != fpos)
                    break;
                s = true;
                this.pos++;
                continue;
            }
            if (c < 48 /*"0"*/ || c > 57 /*"9"*/)
                break;
            k = k * 10 + (c - 48 /*"0"*/);
            this.pos++;
        }
        if (s)
            k *= -1;
        return k;
    }

    protected readFloat() {
        let p1 = this.pos;
        let get = this.buf.charCodeAt.bind(this.buf);
        while (true) {
            let c: number = get(this.pos);
            if (this.isEof(c))
                break;
            // + - . , 0-9
            if ((c >= 43 && c < 58) || c === 101 /*"e"*/ || c === 69 /*"E"*/)
                this.pos++;
            else
                break;
        }
        return parseFloat(this.buf.substr(p1, this.pos - p1));
    }

    public unserialize(): any {
        let err = (s: string) => {
            return new Error("Unserialization of " + s + " not implemented");
        }
        let get = this.buf.charCodeAt.bind(this.buf);
        switch (get(this.pos++)) {
            case 110: // "n" null
                return null;
            case 116: // "t" bool true
                return true;
            case 102: // "f" bool false
                return false;
            case 122: // "z" zero
                return 0;
            case 105: // "i" integer
                return this.readDigits();
            case 100: // "d" float
                return this.readFloat();
            case 121: // "y" string
                let len = this.readDigits();
                if (get(this.pos++) !== 58 /*":"*/ || this.length - this.pos < len)
                    throw new Error("Invalid string length");
                let s = this.buf.substr(this.pos, len);
                this.pos += len;
                s = decodeURIComponent(s);
                this.scache.push(s);
                return s;
            case 107: // "k" NaN
                return NaN;
            case 109: // "m"
                return Number.NEGATIVE_INFINITY;
            case 112: // "p"
                return Number.POSITIVE_INFINITY;
            case 97: // "a" Array
                let a = new Array<any>();
                this.cache.push(a);
                while (true) {
                    let c = get(this.pos);
                    if (c === 104 /* "h" */) {
                        this.pos++;
                        break;
                    }
                    if (c === 117 /* "u" */) {
                        this.pos++;
                        let n = this.readDigits();
                        a[a.length + n - 1] = null;
                    } else
                        a.push(this.unserialize());
                }
                return a;
            case 111: // "o" object
                let o = {};
                this.cache.push(o);
                this.unserializeObject(o);
                return o;
            case 114: // "r" class enum or structure reference
                let n = this.readDigits();
                if (n < 0 || n >= this.cache.length)
                    throw new Error("Invalid reference");
                return this.cache[n];
            case 82: // "R" string reference
                let nn = this.readDigits();
                if (nn < 0 || nn >= this.scache.length)
                    throw new Error("Invalid string reference");
                return this.scache[nn];
            case 120: // "x" throw an exception
                throw new HaxeException(this.unserialize());
            case 99: // "c" class instance
                let cname = this.unserialize();
                let cli = this.resolver.resolveClass(cname);
                if (!cli && !this.allowUnregistered)
                    throw new Error("Class not found " + cname);
                let co: any = Object.create(cli?.prototype ?? Object.prototype); // creates an empty instance, no constructor is called
                if (!cli && this.addTypeHints)
                    addTypeHint(co, cname)
                this.cache.push(co);
                this.unserializeObject(co);
                return co;
            case 119: // "w" enum instance by name
                let ename1 = this.unserialize();
                let edecl1 = this.resolver.resolveEnum(ename1);
                if (!edecl1 && !this.allowUnregistered)
                    throw new Error("Enum not found " + ename1);
                let e1 = this.unserializeEnum(edecl1, this.unserialize(), ename1);
                this.cache.push(e1);
                this.pos++;
                return e1;
            case 106: // "j" enum instance by index
                let ename2 = this.unserialize();
                let edecl2 = this.resolver.resolveEnum(ename2);
                if (!edecl2 && !this.allowUnregistered)
                    throw new Error("Enum not found " + ename2);
                this.pos++; /* skip ':' */
                let index = this.readDigits();
                let e2 = this.unserializeEnum(edecl2, index, ename2);
                this.cache.push(e2);
                this.pos++;
                return e2;
            case 108: // "l" haxe list to javascript array
                let l = new Array<any>();
                if (this.addTypeHints)
                    // @ts-ignore
                    addTypeHint(l, "List")
                this.cache.push(l);
                while (get(this.pos) !== 104 /* "h" */)
                    l.push(this.unserialize());
                this.pos++;
                return l;
            case 98: // "b" string map
                let hsm: Record<string, any> = {};
                if (this.addTypeHints)
                    addTypeHint(hsm, "StringMap");
                this.cache.push(hsm);
                while (get(this.pos) != 104 /* "h" */) {
                    let smt = this.unserialize();
                    hsm[smt] = this.unserialize();
                }
                this.pos++;
                return hsm;
            case 113: // "q" haxe int map
                let him: Record<number, any> = {};
                if (this.addTypeHints)
                    // @ts-ignore
                    addTypeHint(him, "IntMap");
                this.cache.push(him);
                let c = get(this.pos++);
                while (c === 58 /* ":" */) {
                    let i = this.readDigits();
                    him[i] = this.unserialize();
                    c = get(this.pos++);
                }
                if (c !== 104 /* "h" */)
                    throw new Error("Invalid IntMap format");
                return him;
            case 77: // "M" haxe object map
                let wm: any = {keys: [], values: []};
                if (this.addTypeHints)
                    // @ts-ignore
                    addTypeHint(wm, "ObjectMap");
                this.cache.push(wm);
                while (get(this.pos) !== 104 /* "h" */) {
                    wm.keys.push(this.unserialize());
                    wm.values.push(this.unserialize());
                }
                this.pos++;
                return wm;
            case 118: // "v" Date
                let dateStr = this.buf.substr(this.pos, 19);
                this.pos += 19;
                let [date, time] = dateStr.split(' ')
                let d: Date = new Date(`${date}T${time}Z`);
                this.cache.push(d);
                return d;
            case 115: // "s" Buffers
                let bytesLen = this.readDigits();
                if (get(this.pos++) !== 58 /*":"*/ || this.length - this.pos < bytesLen)
                    throw new Error("Invalid bytes length");
                let bytes = Buffer.from(
                    this.buf.substr(this.pos, bytesLen)
                        .replace(/%/g, '+')
                        .replace(/:/g, '/'),
                    'base64');
                this.pos += bytesLen;
                this.cache.push(bytes);
                return bytes;
            case 67: // "C" custom
                let name = this.unserialize();
                let cl = this.resolver.resolveClass(name);
                if (cl == null)
                    throw new Error("Class not found " + name);
                let cclo: any = Object.create(cl.prototype); // creates an empty instance, no constructor is called
                this.cache.push(cclo);
                // if this throws, it is because the user had an '_haxeEncode' method, but no '_haxeDecode' method
                cclo._haxeDecode(this);
                if (get(this.pos++) !== 103 /*"g"*/)
                    throw new Error("Invalid custom data");
                return cclo;
            case 65: // "A" Class<Dynamic>
                // let name = this.unserialize();
                // let cl = resolver.resolveClass(name);
                // if (cl == null)
                // 	throw new Error("Class not found " + name);
                // return cl;
                throw err("classes");
            case 66: // "B" Enum<Dynamic>
                // let name = this.unserialize();
                // let e = resolver.resolveEnum(name);
                // if (e == null)
                // 	throw new Error("Enum not found " + name);
                // return e;
                throw err("enums");
            default:
        }
        this.pos--;
        throw (new Error("Invalid char " + get(this.pos) + " at position " + this.pos));
    }

}
