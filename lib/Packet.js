"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = void 0;
var Serializer_1 = require("./Serializer");
var Unserializer_1 = require("./Unserializer");
var Packet = (function () {
    function Packet(id, fields) {
        this.id = id;
        this.fields = fields;
    }
    Packet.register = function (id, classRef) {
        if (Packet.registry[id])
            throw new Error("A packet with id " + id + " has already been registered");
        Packet.registry[id] = classRef;
    };
    Packet.decode = function (str) {
        var uns = new Unserializer_1.Unserializer(str);
        var msgId = uns.unserialize();
        if (typeof msgId !== 'number')
            throw new Error("packet msgId '" + msgId + "' was a " + typeof msgId);
        msgId = Math.floor(msgId);
        if (!Packet.registry[msgId])
            throw new Error("No packet registered for packet id " + msgId);
        var p = new Packet.registry[msgId]();
        var fields = p.fields;
        var obj = {};
        for (var i = 0; i < fields.length; i++) {
            var key = fields[i];
            var data = uns.unserialize();
            obj[key] = data;
        }
        return p.fromObj(obj);
    };
    Packet.prototype.test = function () {
        var _this = this;
        this.fields.forEach(function (element) {
            if (!_this.hasOwnProperty(element)) {
                throw new Error("Field '" + element + "' does not exist");
            }
            var type = typeof _this[element];
            if (type === 'function' || type === 'undefined') {
                throw new Error("Invalid field type '" + type + "' for field '" + element + "'");
            }
        });
    };
    Packet.prototype.toJSON = function () {
        var obj = { id: this.id };
        for (var i = 0; i < this.fields.length; i++) {
            var f = this.fields[i];
            obj[f] = this[f];
        }
        return JSON.stringify(obj);
    };
    Packet.prototype.encode = function () {
        var ser = new Serializer_1.Serializer();
        ser.serialize(this.id);
        for (var i = 0; i < this.fields.length; i++) {
            ser.serialize(this[this.fields[i]]);
        }
        return ser.toString();
    };
    Packet.prototype.getInt = function (v) {
        if (typeof v === 'number')
            return isNaN(v) ? v : Math.floor(v);
        throw new Error("Not an int. Got " + v + " which is a typeof " + typeof v);
    };
    Packet.prototype.getFloat = function (v) {
        if (typeof v === 'number')
            return v;
        throw new Error("Not a float. Got " + v + " which is a typeof " + typeof v);
    };
    Packet.prototype.getString = function (v) {
        if (typeof v === 'string')
            return v;
        throw new Error("Not a string. Got " + v + " which is a typeof " + typeof v);
    };
    Packet.prototype.getArray = function (v) {
        if (Array.isArray(v))
            return v;
        throw new Error("Not an array. Got " + v + " which is a typeof " + typeof v);
    };
    Packet.registry = {};
    return Packet;
}());
exports.Packet = Packet;
//# sourceMappingURL=Packet.js.map