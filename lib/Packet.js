"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = void 0;
var Serializer_1 = require("./Serializer");
var Unserializer_1 = require("./Unserializer");
var Packet = /** @class */ (function () {
    function Packet(id, fields /*(keyof Packet)[]*/) {
        this.id = id;
        this.fields = fields;
    }
    /**
     * Must be called by all pakect types after the class definition
     * @param id The packet id must be unique for each packet class
     * @param classRef the class constructor. Usually just the name of the class
     */
    Packet.register = function (id, classRef) {
        if (Packet.registry[id])
            throw new Error("A packet with id " + id + " has already been registered");
        Packet.registry[id] = classRef;
    };
    /**
     * Calling this method will deserialize a acpket, creating a new instance
     * of any class that is a subclass of and registered with Packet
     * @param str Serialized packet data
     */
    Packet.decode = function (str) {
        var uns = new Unserializer_1.Unserializer(str);
        var msgId = uns.unserialize();
        // console.log(`Got ${msgId}`);
        if (typeof msgId !== 'number')
            throw new Error("packet msgId '" + msgId + "' was a " + typeof msgId);
        msgId = Math.floor(msgId);
        if (!Packet.registry[msgId])
            throw new Error("No packet registered for packet id " + msgId);
        var p = new Packet.registry[msgId]();
        // console.log(p);
        var fields = p.fields;
        var obj = {};
        for (var i = 0; i < fields.length; i++) {
            var key = fields[i];
            var data = uns.unserialize();
            obj[key] = data;
        }
        return p.fromObj(obj);
    };
    /**
     * Test that the fields all exist
     */
    Packet.prototype.test = function () {
        var _this = this;
        this.fields.forEach(function (element) {
            if (!_this.hasOwnProperty(element)) {
                throw new Error("Field '" + element + "' does not exist");
            }
            // @ts-ignore
            var type = typeof _this[element];
            if (type === 'function' || type === 'undefined') {
                throw new Error("Invalid field type '" + type + "' for field '" + element + "'");
            }
        });
    };
    /**
     * Returns a json version of this packet
     */
    Packet.prototype.toJSON = function () {
        var obj = { id: this.id };
        for (var i = 0; i < this.fields.length; i++) {
            var f = this.fields[i];
            // @ts-ignore
            obj[f] = this[f];
        }
        return JSON.stringify(obj);
    };
    /**
     * Serialize this packet.
     * This method does not have to be overridden by subclasses.
     *
     * @returns Packet serialized
     */
    Packet.prototype.encode = function () {
        var ser = new Serializer_1.Serializer();
        ser.serialize(this.id);
        for (var i = 0; i < this.fields.length; i++) {
            // @ts-ignore
            ser.serialize(this[this.fields[i]]);
        }
        return ser.toString();
    };
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully a number from the serialized data
     * @returns Math.floor of number
     * @throws Error if value not a number
     */
    Packet.prototype.getInt = function (v) {
        // console.log(`getInt ${v} ` + typeof v);
        if (typeof v === 'number')
            return isNaN(v) ? v : Math.floor(v);
        throw new Error("Not an int. Got " + v + " which is a typeof " + typeof v);
    };
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully a number from the serialized data
     * @returns A number
     * @throws Error if value not a number
     */
    Packet.prototype.getFloat = function (v) {
        if (typeof v === 'number')
            return v;
        throw new Error("Not a float. Got " + v + " which is a typeof " + typeof v);
    };
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully a string from the serialized data
     * @returns String value
     * @throws Error if value not a string
     */
    Packet.prototype.getString = function (v) {
        if (typeof v === 'string')
            return v;
        throw new Error("Not a string. Got " + v + " which is a typeof " + typeof v);
    };
    /**
     * Type check data, for use in {@link fromObj}
     * @param v Hopefully an Array from the serialized data
     * @returns Typed array
     * @throws Error if value not an Array
     */
    Packet.prototype.getArray = function (v) {
        if (Array.isArray(v))
            return v;
        throw new Error("Not an array. Got " + v + " which is a typeof " + typeof v);
    };
    Packet.registry = {};
    return Packet;
}());
exports.Packet = Packet;
