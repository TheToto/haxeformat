"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializer = void 0;
var buffer_1 = require("buffer");
var HaxeEnum_1 = require("./HaxeEnum");
var HaxeType_1 = require("./HaxeType");
function getTypeHint(value) {
    var _a;
    return (_a = value["___type"]) !== null && _a !== void 0 ? _a : null;
}
function iterateFieldsObject(object, func) {
    Reflect.ownKeys(object).forEach(function (key, i) {
        if (key !== "___type")
            func(key, i);
    });
}
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
        switch (this.detectHaxeType(v)) {
            case HaxeType_1.HaxeType.TNull:
                this.buf += "n";
                return;
            case HaxeType_1.HaxeType.TInt:
                if (v == 0) {
                    this.buf += "z";
                }
                else {
                    this.buf += "i" + v;
                }
                return;
            case HaxeType_1.HaxeType.TFloat:
                if (isNaN(v)) {
                    this.buf += "k";
                }
                else if (!isFinite(v)) {
                    this.buf += (v < 0) ? "m" : "p";
                }
                else {
                    this.buf += "d" + v;
                }
                return;
            case HaxeType_1.HaxeType.TBool:
                this.buf += v ? "t" : "f";
                return;
            case HaxeType_1.HaxeType.TObject:
            case HaxeType_1.HaxeType.TClass:
                if (typeof v === "string") {
                    this.serializeString(v);
                    return;
                }
                if (this.useCache && this.serializeRef(v))
                    return;
                if (Array.isArray(v)) {
                    if (getTypeHint(v) === "List") {
                        this.buf += "l";
                        for (var i = 0; i < v.length; i++) {
                            this.serialize(v[i]);
                        }
                    }
                    else {
                        var ucount = 0;
                        this.buf += "a";
                        var l = v.length;
                        for (var i = 0; i < l; i++) {
                            if (v[i] === null || v[i] === undefined) {
                                ucount++;
                            }
                            else {
                                if (ucount > 0) {
                                    if (ucount == 1)
                                        this.buf += "n";
                                    else
                                        this.buf += "u" + ucount;
                                    ucount = 0;
                                }
                                this.serialize(v[i]);
                            }
                        }
                        if (ucount > 0) {
                            if (ucount == 1)
                                this.buf += "n";
                            else
                                this.buf += "u" + ucount;
                        }
                    }
                    this.buf += "h";
                    return;
                }
                else if (buffer_1.Buffer.isBuffer(v)) {
                    this.buf += "s";
                    var bufStr = v.toString('base64')
                        .replace(/\+/g, '%')
                        .replace(/\//g, ':')
                        .replace(/={1,3}$/, '');
                    this.buf += bufStr.length;
                    this.buf += ":";
                    this.buf += bufStr;
                    return;
                }
                else if ((_a = v.constructor) === null || _a === void 0 ? void 0 : _a.name) {
                    this.serializeClass(v, v.constructor.name);
                    return;
                }
                throw new Error("Type not detected");
            case HaxeType_1.HaxeType.TEnum:
                if (this.useCache && this.serializeRef(v))
                    return;
                var constructor_1 = v.constructor;
                this.buf += this.useEnumIndex ? "j" : "w";
                this.serializeString(constructor_1.enum);
                if (this.useEnumIndex) {
                    this.buf += ":";
                    var constructs = constructor_1.getEnumConstructs();
                    var index = constructs.findIndex(function (e) { return e.tag === constructor_1.tag; });
                    if (index === -1)
                        throw new Error("Invalid enum tag " + constructor_1.tag + ". Should be one of \"" + constructs.map(function (c) { return c.tag; }).join(',') + "\".");
                    this.buf += index;
                }
                else {
                    this.serializeString(constructor_1.tag);
                }
                this.buf += ":";
                var params = v.getParams();
                this.buf += params.length;
                params.forEach(function (param) {
                    _this.serialize(param);
                });
                return;
            case HaxeType_1.HaxeType.TFunction:
                throw new Error("Serialization of 'TFunction' not implemented");
        }
    };
    Serializer.prototype.detectHaxeType = function (v) {
        switch (typeof v) {
            case "boolean":
                return HaxeType_1.HaxeType.TBool;
            case "number":
                if (!isNaN(v) && isFinite(v) && Math.ceil(v) == v % 2147483648.0) {
                    return HaxeType_1.HaxeType.TInt;
                }
                return HaxeType_1.HaxeType.TFloat;
                break;
            case "string":
                return HaxeType_1.HaxeType.TClass;
            case "undefined":
                return HaxeType_1.HaxeType.TNull;
            case "object":
                if (v === null) {
                    return HaxeType_1.HaxeType.TNull;
                }
                if (v instanceof HaxeEnum_1.HaxeEnum && v.constructor) {
                    return HaxeType_1.HaxeType.TEnum;
                }
                return HaxeType_1.HaxeType.TClass;
            default:
                throw new Error("Serialization " + typeof v + " of not implemented");
        }
    };
    Serializer.prototype.serializeString = function (s) {
        var x = this.shash[s];
        if (x !== undefined) {
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
    Serializer.prototype.serializeDate = function (date) {
        var year = date.getUTCFullYear();
        var month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
        var day = ("0" + date.getUTCDate()).slice(-2);
        var hour = ("0" + date.getUTCHours()).slice(-2);
        var minute = ("0" + date.getUTCMinutes()).slice(-2);
        var seconds = ("0" + date.getUTCSeconds()).slice(-2);
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + seconds;
    };
    Serializer.prototype.serializeClass = function (v, className) {
        var _this = this;
        var _a;
        switch (className) {
            case Date.name:
                this.buf += "v";
                this.buf += this.serializeDate(v);
                return;
            case Array.name:
                throw new Error("Arrays should not get here");
            case WeakMap.name:
                throw new Error("WeakMap not supported");
            case Error.name:
                this.buf += "x";
                this.serialize((_a = v.data) !== null && _a !== void 0 ? _a : v.message);
                return;
            case Object.name:
                var typeHint = getTypeHint(v);
                switch (typeHint) {
                    case "IntMap":
                        this.buf += "q";
                        iterateFieldsObject(v, function (key) {
                            if (typeof key !== "number") {
                                _this.buf += ":" + parseInt(String(key));
                            }
                            else {
                                _this.buf += ":" + Number(key);
                            }
                            _this.serialize(Reflect.get(v, key));
                        });
                        this.buf += "h";
                        return;
                    case "ObjectMap":
                        if (Array.isArray(v["keys"]) && Array.isArray(v["values"])) {
                            this.buf += "M";
                            for (var i = 0; i < v.keys.length; i++) {
                                this.serialize(v.keys[i]);
                                this.serialize(v.values[i]);
                            }
                            this.buf += "h";
                            return;
                        }
                        throw new Error("Invalid ObjectMap");
                    case "StringMap":
                        this.buf += "b";
                        iterateFieldsObject(v, function (key) {
                            _this.serializeString(String(key));
                            _this.serialize(Reflect.get(v, key));
                        });
                        this.buf += "h";
                        return;
                    case "List":
                        throw new Error("___type is List but the value is not an array");
                    default:
                        if (typeHint) {
                            this.serializeClass(v, typeHint);
                            return;
                        }
                        this.buf += "o";
                        this.serializeFields(v);
                        return;
                }
            default:
                if (typeof v['hxSerialize'] === 'function') {
                    this.buf += "C";
                    this.serializeString(className);
                    v.hxSerialize(this);
                    this.buf += "g";
                }
                else {
                    this.buf += "c";
                    this.serializeString(className);
                    this.serializeFields(v);
                }
                return;
        }
    };
    Serializer.prototype.serializeFields = function (v, endChar) {
        var _this = this;
        if (endChar === void 0) { endChar = "g"; }
        iterateFieldsObject(v, function (key) {
            if (typeof key !== 'string')
                throw new Error("Class field " + String(key) + " is a " + typeof key);
            _this.serializeString(key);
            _this.serialize(Reflect.get(v, key));
        });
        this.buf += endChar;
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