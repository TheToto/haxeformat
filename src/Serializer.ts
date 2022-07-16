import { Buffer } from "buffer"
import { HaxeEnum } from "./HaxeEnum"
import { TypeHint } from "./Unserializer"
import { HaxeType } from "./HaxeType"

function getTypeHint(value: any): TypeHint | null {
    return value["___type"] ?? null
}

function iterateFieldsObject(object: any, func: (key: PropertyKey, index: number) => void) {
    Reflect.ownKeys(object).forEach((key, i) => {
        if (key !== "___type") func(key, i)
    })
}

export class Serializer {
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
    public static USE_CACHE: boolean = false
    public static USE_ENUM_INDEX: boolean = true

    // /**
    // 	Use constructor indexes for enums instead of names.

    // 	This may reduce the size of serialization Strings, but makes them less
    // 	suited for long-term storage: If constructors are removed or added from
    // 	the enum, the indices may no longer match.

    // 	This value can be changed for individual instances of `Serializer` by
    // 	setting their `useEnumIndex` field.
    // **/
    // public static USE_ENUM_INDEX : boolean = false;

    /**
     * Serializes `v` and returns the String representation.
     *
     * This is a convenience function for creating a new instance of
     * Serializer, serialize `v` into it and obtain the result through a call
     * to `toString()`.
     */
    public static run(v: any) {
        let s = new Serializer()
        s.serialize(v)
        return s.toString()
    }

    protected shash: Record<string, number> = {}
    protected scount: number = 0
    protected buf: string = ""
    protected cache: Array<any> = []

    /**
     * The individual cache setting for 'this' Serializer instance.
     * See {@link USE_CACHE} for a complete description
     */
    public useCache: boolean = Serializer.USE_CACHE
    public useEnumIndex: boolean = Serializer.USE_ENUM_INDEX

    constructor() {}

    /**
     * Return the String representation of this Serializer. This may
     * be called after any call to {@link serialize} without affecting
     * subsequent calls to {@link serialize}
     */
    public toString() {
        return this.buf
    }

    /**
     * Returns the serialized data as a byte buffer.
     * @see toString
     */
    public toBuffer() {
        return Buffer.from(this.buf)
    }

    /**
     * Once you have created a serializer, just keep serializing things
     * by calling this method. At any point, you can call {@link toString}
     * to get the current encode buffer.
     * @param v Any value to serialize
     */
    public serialize(v: any): void {
        switch (this.detectHaxeType(v)) {
            case HaxeType.TNull:
                this.buf += "n"
                return
            case HaxeType.TInt: // TFloat / TInt
                if (v == 0) {
                    this.buf += "z"
                } else {
                    this.buf += `i${v}`
                }
                return
            case HaxeType.TFloat:
                if (isNaN(v)) {
                    this.buf += "k"
                } else if (!isFinite(v)) {
                    this.buf += v < 0 ? "m" : "p"
                } else {
                    this.buf += `d${v}`
                }
                return
            case HaxeType.TBool:
                this.buf += v ? "t" : "f"
                return
            case HaxeType.TObject:
            case HaxeType.TClass:
                if (typeof v === "string") {
                    this.serializeString(v)
                    return
                }

                if (this.useCache && this.serializeRef(v)) return

                if (Array.isArray(v)) {
                    if (getTypeHint(v) === "List") {
                        this.buf += "l"
                        for (let i = 0; i < v.length; i++) {
                            this.serialize(v[i])
                        }
                    } else {
                        // Array of no type hint
                        let ucount = 0
                        this.buf += "a"
                        let l = v.length
                        for (let i = 0; i < l; i++) {
                            if (v[i] === null || v[i] === undefined) {
                                ucount++
                            } else {
                                if (ucount > 0) {
                                    if (ucount == 1) this.buf += "n"
                                    else this.buf += `u${ucount}`
                                    ucount = 0
                                }
                                this.serialize(v[i])
                            }
                        }
                        if (ucount > 0) {
                            if (ucount == 1) this.buf += "n"
                            else this.buf += `u${ucount}`
                        }
                    }
                    this.buf += "h"
                    return
                } else if (Buffer.isBuffer(v)) {
                    this.buf += "s"
                    let bufStr = v
                        .toString("base64")
                        .replace(/\+/g, "%")
                        .replace(/\//g, ":")
                        .replace(/={1,3}$/, "")
                    this.buf += bufStr.length
                    this.buf += ":"
                    this.buf += bufStr
                    return
                } else if (v.constructor?.name) {
                    this.serializeClass(v, v.constructor.name)
                    return
                }
                throw new Error("Type not detected")
            case HaxeType.TEnum:
                if (this.useCache && this.serializeRef(v)) return

                const constructor = v.constructor as typeof HaxeEnum
                this.buf += this.useEnumIndex ? "j" : "w"
                this.serializeString(constructor.enum)
                if (this.useEnumIndex) {
                    this.buf += ":"
                    let constructs = constructor.getEnumConstructs()
                    let index = constructs.findIndex((e: typeof HaxeEnum) => e.tag === constructor.tag)
                    if (index === -1)
                        throw new Error(
                            `Invalid enum tag ${constructor.tag}. Should be one of "${constructs
                                .map((c: typeof HaxeEnum) => c.tag)
                                .join(",")}".`
                        )
                    this.buf += index
                } else {
                    this.serializeString(constructor.tag)
                }
                this.buf += ":"
                let params = v.getParams()
                this.buf += params.length
                params.forEach((param: any) => {
                    this.serialize(param)
                })
                return
            case HaxeType.TFunction:
                throw new Error(`Serialization of 'TFunction' not implemented`)
        }
    }

    protected detectHaxeType(v: any): HaxeType {
        switch (typeof v) {
            case "boolean": // TBool
                return HaxeType.TBool
            case "number": // TFloat / TInt
                if (!isNaN(v) && isFinite(v) && Math.ceil(v) == v % 2147483648.0) {
                    return HaxeType.TInt
                }
                return HaxeType.TFloat
            case "string":
                return HaxeType.TClass
            case "undefined":
                return HaxeType.TNull
            case "object":
                if (v === null) {
                    return HaxeType.TNull
                }
                if (v instanceof HaxeEnum && v.constructor) {
                    return HaxeType.TEnum
                }
                return HaxeType.TClass
            default: // TFunction & TUnknown (bigint, function, symbol)
                throw new Error(`Serialization ${typeof v} of not implemented`)
        }
    }

    protected serializeString(s: string) {
        let x = this.shash[s]
        if (x !== undefined) {
            this.buf += "R"
            this.buf += x
            return
        }
        this.shash[s] = this.scount++

        this.buf += "y"
        s = encodeURIComponent(s)

        this.buf += s.length
        this.buf += ":"
        this.buf += s
    }

    protected serializeDate(date: Date) {
        let year = date.getUTCFullYear()
        let month = ("0" + (date.getUTCMonth() + 1)).slice(-2)
        let day = ("0" + date.getUTCDate()).slice(-2)
        let hour = ("0" + date.getUTCHours()).slice(-2)
        let minute = ("0" + date.getUTCMinutes()).slice(-2)
        let seconds = ("0" + date.getUTCSeconds()).slice(-2)
        return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`
    }

    protected serializeClass(v: any, className: string) {
        switch (className) {
            case Date.name:
                this.buf += "v"
                this.buf += this.serializeDate(v)
                return
            case Array.name:
                throw new Error("Arrays should not get here")
            case WeakMap.name:
                // We can't iterate over fields...
                throw new Error("WeakMap not supported")
            case Error.name:
                this.buf += "x"
                this.serialize(v.data ?? v.message)
                return
            case Object.name:
                let typeHint = getTypeHint(v)
                switch (typeHint) {
                    case "IntMap":
                        this.buf += "q"
                        iterateFieldsObject(v, (key) => {
                            if (typeof key !== "number") {
                                this.buf += `:${parseInt(String(key))}`
                            } else {
                                this.buf += `:${Number(key)}`
                            }
                            this.serialize(Reflect.get(v, key))
                        })
                        this.buf += "h"
                        return
                    case "ObjectMap":
                        if (Array.isArray(v["keys"]) && Array.isArray(v["values"])) {
                            this.buf += "M"
                            for (let i = 0; i < v.keys.length; i++) {
                                this.serialize(v.keys[i])
                                this.serialize(v.values[i])
                            }
                            this.buf += "h"
                            return
                        }
                        throw new Error("Invalid ObjectMap")
                    case "StringMap":
                        this.buf += "b"
                        iterateFieldsObject(v, (key) => {
                            this.serializeString(String(key))
                            this.serialize(Reflect.get(v, key))
                        })
                        this.buf += "h"
                        return
                    case "List":
                        throw new Error("___type is List but the value is not an array")
                    default:
                        if (typeHint) {
                            this.serializeClass(v, typeHint)
                            return
                        }
                        this.buf += "o"
                        this.serializeFields(v)
                        return
                }
            default:
                if (typeof v["hxSerialize"] === "function") {
                    this.buf += "C"
                    this.serializeString(className)
                    v.hxSerialize(this)
                    this.buf += "g"
                } else {
                    this.buf += "c"
                    this.serializeString(className)
                    this.serializeFields(v)
                }
                return
        }
    }

    protected serializeFields(v: {}, endChar = "g") {
        iterateFieldsObject(v, (key) => {
            if (typeof key !== "string") throw new Error(`Class field ${String(key)} is a ` + typeof key)
            this.serializeString(key)
            this.serialize(Reflect.get(v, key))
        })
        this.buf += endChar
    }

    protected serializeRef(v: any) {
        let vt = typeof v

        for (let i = 0; i < this.cache.length; i++) {
            let ci = this.cache[i]
            if (typeof ci === vt && ci === v) {
                this.buf += "r"
                this.buf += String(i)
                return true
            }
        }
        this.cache.push(v)
        return false
    }
}

// prefixes :
// 	a : array
// 	b : hash
// 	c : class
// 	d : Float
// 	e : reserved (float exp)
// 	f : false
// 	g : object end
// 	h : array/list/hash end
// 	i : Int
// 	j : enum (by index)
// 	k : NaN
// 	l : list
// 	m : -Inf
// 	n : null
// 	o : object
// 	p : +Inf
// 	q : haxe.ds.IntMap
// 	r : reference
// 	s : bytes (base64)
// 	t : true
// 	u : array nulls
// 	v : date
// 	w : enum (by name)
// 	x : exception
// 	y : urlencoded string
// 	z : zero
// 	A : Class<Dynamic>
// 	B : Enum<Dynamic>
// 	C : custom (if hxSerialize is a function on the class)
// 	M : haxe.ds.ObjectMap
