"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializer = void 0;
var buffer_1 = require("buffer");
var HaxeEnum_1 = require("./HaxeEnum");
var Serializer = (function () {
    function Serializer() {
        this.shash = {};
        this.scount = 0;
        this.buf = "";
        this.cache = [];
        this.useCache = Serializer.USE_CACHE;
        this.useEnumIndex = Serializer.USE_ENUM_INDEX;
    }
    Serializer.run = function (v) {
        var s = new Serializer();
        s.serialize(v);
        return s.toString();
    };
    Serializer.prototype.toString = function () {
        return this.buf;
    };
    Serializer.prototype.toBuffer = function () {
        return buffer_1.Buffer.from(this.buf);
    };
    Serializer.prototype.serialize = function (v) {
        var _this = this;
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
                if (buffer_1.Buffer.isBuffer(v)) {
                    this.buf += "s";
                    var bufStr = v.toString('base64');
                    this.buf += bufStr.length;
                    this.buf += ":";
                    this.buf += bufStr;
                    return;
                }
                if (v instanceof HaxeEnum_1.HaxeEnum && v.constructor) {
                    if (this.useEnumIndex) {
                        this.buf += "j";
                        this.serialize(v.name);
                        this.buf += ":";
                        var constructs = v.constructor.getEnumConstructs();
                        var index = constructs.findIndex(function (e) { return e.name === v.tag; });
                        if (index === -1)
                            throw err("Invalid enum constructs");
                        this.buf += index;
                        this.buf += ":";
                        var params = v.getParams();
                        this.buf += params.length;
                        params.forEach(function (param) {
                            _this.serialize(param);
                        });
                        return;
                    }
                    else {
                        this.buf += "w";
                        this.serialize(v.name);
                        this.serialize(v.tag);
                        this.buf += ":";
                        var params = v.getParams();
                        this.buf += params.length;
                        params.forEach(function (param) {
                            _this.serialize(param);
                        });
                        return;
                    }
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
        switch (className) {
            case Date.name:
                this.buf += "v";
                this.buf += String(v.getTime());
                break;
            case Array.name:
                throw new Error("Arrays should not get here");
            case Object.name:
                this.buf += "o";
                this.serializeFields(v);
                return;
            default:
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
    Serializer.USE_CACHE = false;
    Serializer.USE_ENUM_INDEX = true;
    return Serializer;
}());
exports.Serializer = Serializer;
//# sourceMappingURL=Serializer.js.map