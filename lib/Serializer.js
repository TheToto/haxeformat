"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializer = void 0;
var Serializer = /** @class */ (function () {
    function Serializer() {
        this.shash = {};
        this.scount = 0;
        this.buf = "";
        this.cache = [];
        /**
         * The individual cache setting for 'this' Serializer instance.
         * See {@link USE_CACHE} for a complete description
         */
        this.useCache = Serializer.USE_CACHE;
    }
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
    Serializer.run = function (v) {
        var s = new Serializer();
        s.serialize(v);
        return s.toString();
    };
    /**
     * Return the String representation of this Serializer. This may
     * be called after any call to {@link serialize} without affecting
     * subsequent calls to {@link serialize}
     */
    Serializer.prototype.toString = function () {
        return this.buf;
    };
    /**
     * Returns the serialized data as a byte buffer.
     * @see toString
     */
    Serializer.prototype.toBuffer = function () {
        return Buffer.from(this.buf);
    };
    /**
     * Once you have created a serializer, just keep serializing things
     * by calling this method. At any point, you can call {@link toString}
     * to get the current encode buffer.
     * @param v Any value to serialize
     */
    Serializer.prototype.serialize = function (v) {
        var _a;
        var err = function (s) {
            s = s ? s : typeof v;
            return new Error("Serialization of " + s + " not implemented");
        };
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
                    this.buf += "i" + v;
                    return;
                }
                else {
                    this.buf += "d" + v;
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
                    var ucount = 0;
                    this.buf += "a";
                    var l = v.length;
                    for (var i = 0; i < l; i++) {
                        if (v[i] === null || v[i] === undefined)
                            ucount++;
                        else {
                            if (ucount > 0) {
                                if (ucount == 1)
                                    this.buf += "n";
                                else {
                                    this.buf += "u" + ucount;
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
                            this.buf += "u" + ucount;
                        }
                    }
                    this.buf += "h";
                    return;
                }
                if (Buffer.isBuffer(v)) {
                    this.buf += "s";
                    var bufStr = v.toString('base64');
                    this.buf += bufStr.length;
                    this.buf += ":";
                    this.buf += bufStr;
                    return;
                }
                if ((_a = v.constructor) === null || _a === void 0 ? void 0 : _a.name) {
                    try {
                        this.serializeClass(v, v.constructor.name);
                    }
                    catch (e) {
                        throw err(e.message);
                    }
                    return;
                }
                throw new Error("Not detected");
            default:
                throw new Error("unknown type " + v);
        }
    };
    Serializer.prototype.serializeString = function (s) {
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
    };
    Serializer.prototype.serializeClass = function (v, className) {
        // uses .name syntax because there may be an issue in minified code
        // where the name of the class has been changed. Not so for built-ins
        // but good practice nonetheless
        switch (className) {
            case Date.name:
                this.buf += "v";
                this.buf += String(v.getTime());
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
                }
                else {
                    this.buf += "c";
                    this.serializeString(className);
                    if (this.useCache)
                        this.cache.push(v);
                    this.serializeFields(v);
                }
                return;
        }
    };
    Serializer.prototype.serializeFields = function (v) {
        var _this = this;
        Reflect.ownKeys(v).forEach(function (key) {
            if (typeof key !== 'string')
                throw new Error("Class field " + String(key) + " is a " + typeof key);
            _this.serializeString(key);
            _this.serialize(Reflect.get(v, key));
        });
        this.buf += "g";
    };
    Serializer.prototype.serializeRef = function (v) {
        var vt = typeof v;
        for (var i = 0; i < this.cache.length; i++) {
            var ci = this.cache[i];
            if (typeof ci === vt && ci === v) {
                this.buf += "r";
                this.buf += String(i);
                return true;
            }
        }
        this.cache.push(v);
        return false;
    };
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
    Serializer.USE_CACHE = false;
    return Serializer;
}());
exports.Serializer = Serializer;
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
