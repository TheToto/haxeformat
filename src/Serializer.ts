import { Buffer } from 'buffer'
import {HaxeEnum} from "./HaxeEnum";

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
	public static USE_CACHE: boolean = false;
	public static USE_ENUM_INDEX: boolean = true;

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
		var s = new Serializer();
		s.serialize(v);
		return s.toString();
	}

	protected shash: Record<string, number> = {};
	protected scount: number = 0;
	protected buf: string = "";
	protected cache: Array<any> = [];

	/**
	 * The individual cache setting for 'this' Serializer instance.
	 * See {@link USE_CACHE} for a complete description
	 */
	public useCache: boolean = Serializer.USE_CACHE;
	public useEnumIndex: boolean = Serializer.USE_ENUM_INDEX;

	constructor() { }

	/**
	 * Return the String representation of this Serializer. This may
	 * be called after any call to {@link serialize} without affecting
	 * subsequent calls to {@link serialize}
	 */
	public toString() {
		return this.buf;
	}

	/**
	 * Returns the serialized data as a byte buffer.
	 * @see toString 
	 */
	public toBuffer() {
		return Buffer.from(this.buf);
	}

	/**
	 * Once you have created a serializer, just keep serializing things
	 * by calling this method. At any point, you can call {@link toString}
	 * to get the current encode buffer.
	 * @param v Any value to serialize
	 */
	public serialize(v: any): void {
		let err = (s?: string) => {
			s = s ? s : typeof v;
			return new Error("Serialization of " + s + " not implemented");
		}
		switch (typeof v) {
			case "bigint":
				throw err();
				break;
			case "boolean":
				this.buf += v ? "t" : "f";
				break;
			case "function":
				throw new Error("Cannot serialize function");
				break;
			case "number":
				if (isNaN(v)) {
					this.buf += "k";
					return;
				}
				if (!isFinite(v)) {
					this.buf += (v < 0) ? "m" : "p";
					return;
				}
				// Haxe's int test
				if (Math.ceil(v) == v % 2147483648.0) {
					if (v == 0) {
						this.buf += "z";
						return;
					}
					this.buf += `i${v}`;
					return;
				} else {
					this.buf += `d${v}`;
				}
				break;
			case "string":
				this.serializeString(v);
				break;
			case "symbol":
				throw err();
				break;
			case "undefined":
				this.buf += "n";
				return;
			case "object":
				if (v === null) {
					this.buf += "n";
					return;
				}

				if (this.useCache && this.serializeRef(v))
					return;

				if (Array.isArray(v)) {
					let ucount = 0;
					this.buf += "a"; // Support list ?
					let l = v.length;
					for (let i = 0; i < l; i++) {
						if (v[i] === null || v[i] === undefined)
							ucount++
						else {
							if (ucount > 0) {
								if (ucount == 1)
									this.buf += "n";
								else {
									this.buf += `u${ucount}`;
								}
								ucount = 0;
							}
							this.serialize(v[i]);
						}
					}
					if (ucount > 0) {
						if (ucount == 1)
							this.buf += "n";
						else {
							this.buf += `u${ucount}`;
						}
					}
					this.buf += "h";
					return
				}
				if (Buffer.isBuffer(v)) {
					this.buf += "s";
					let bufStr = v.toString('base64')
						.replace(/\+/g, '%')
						.replace(/\//g, ':')
						.replace(/={1,2}$/, '');
					this.buf += bufStr.length;
					this.buf += ":";
					this.buf += bufStr;
					return;
				}
				if (v instanceof HaxeEnum && v.constructor) {
					if (this.useEnumIndex) {
						this.buf += "j";
						this.serialize(v.name);
						this.buf += ":";
						let constructs = (v.constructor as typeof HaxeEnum).getEnumConstructs();
						let index = constructs.findIndex((e:any) => e.name === v.tag);
						if (index === -1) throw err("Invalid enum constructs");
						this.buf += index;
						this.buf += ":";
						let params = v.getParams();
						this.buf += params.length;
						params.forEach((param:any) => {
							this.serialize(param);
						})
						return;
					} else {
						this.buf += "w";
						this.serialize(v.name);
						this.serialize(v.tag);
						this.buf += ":";
						let params = v.getParams();
						this.buf += params.length;
						params.forEach((param:any) => {
							this.serialize(param);
						})
						return;					}
				}
				if (v.constructor?.name) {
					try {
						this.serializeClass(v, v.constructor.name);
					} catch (e) {
						throw err(e.message);
					}
					return;
				}
				throw new Error("Not detected");
			default:
				throw new Error("unknown type " + v);
		}
	}

	protected serializeString(s: string) {
		var x = this.shash[s];
		if (x != null) {
			this.buf += "R";
			this.buf += x;
			return;
		}
		this.shash[s] = this.scount++;

		this.buf += "y";
		s = encodeURIComponent(s);

		this.buf += s.length;
		this.buf += ":";
		this.buf += s;
	}

	protected serializeDate(date: Date) {
		let year = date.getUTCFullYear();
		let month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
		let day = ("0" + date.getUTCDate()).slice(-2);
		let hour = ("0" + date.getUTCHours()).slice(-2);
		let minute = ("0" + date.getUTCMinutes()).slice(-2);
		let seconds = ("0" + date.getUTCSeconds()).slice(-2);
		return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`
	}

	protected serializeClass(v: any, className: string) {
		// uses .name syntax because there may be an issue in minified code
		// where the name of the class has been changed. Not so for built-ins
		// but good practice nonetheless
		switch (className) {
			case Date.name:
				this.buf += "v";
				this.buf += this.serializeDate(v);
				break;
			case Array.name:
				throw new Error("Arrays should not get here");
			// 	Int8Array
			// 	Uint8Array
			// 	Uint8ClampedArray
			// 	Int16Array
			// 	Uint16Array
			// 	Int32Array
			// 	Uint32Array
			// 	Float32Array
			// 	Float64Array
			// 	BigInt64Array
			// 	BigUint64Array
			case Object.name:
				this.buf += "o";
				this.serializeFields(v);
				return;
			default:
				// if(this.useCache) this.cache.pop(); // From haxe version. Why??
				if (typeof v['_qwkpktEncode'] === 'function') {
					this.buf += "C";
					this.serializeString(className);
					if (this.useCache)
						this.cache.push(v);
					v._qwkpktEncode(this);
					this.buf += "g";
				} else {
					this.buf += "c";
					this.serializeString(className);
					if (this.useCache)
						this.cache.push(v);
					this.serializeFields(v);
				}
				return;
		}
	}

	protected serializeFields(v: {}) {
		Reflect.ownKeys(v).forEach(key => {
			if (typeof key !== 'string')
				throw new Error(`Class field ${String(key)} is a ` + typeof key)
			this.serializeString(key);
			this.serialize(Reflect.get(v, key));
		});
		this.buf += "g";
	}

	protected serializeRef(v: any) {
		let vt = typeof v;

		for (let i = 0; i < this.cache.length; i++) {
			let ci = this.cache[i];
			if (typeof ci === vt && ci === v) {
				this.buf += "r";
				this.buf += String(i);
				return true;
			}
		}
		this.cache.push(v);
		return false;
	}
}

interface CClass {
	constructor: {
		name: string
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
// 	w : enum *** not impl
// 	x : exception
// 	y : urlencoded string
// 	z : zero
// 	A : Class<Dynamic>
// 	B : Enum<Dynamic>
// 	C : custom (if hxSerialize is a function on the class)
// 	M : haxe.ds.ObjectMap

