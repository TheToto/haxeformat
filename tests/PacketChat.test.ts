// import {describe, it} from 'jasmine';
import "jasmine"
import { Packet, PacketTypes, PacketChat } from "./packet/packets";

describe("PacketChat", () => {
    var pm = new PacketChat("Hi there, how the heck have you been?");
    it("has the right fields", () => {
		expect(() => pm.test()).not.toThrow();
	});
	it("toString", ()=> {
		expect(pm.toString()).toBe("PacketChat[Hi there, how the heck have you been?]");
	});
	it("serialized", ()=>{
		expect(pm.encode()).toBe("i2y55:Hi%20there%2C%20how%20the%20heck%20have%20you%20been%3F");
	});
	it("unserialized", () => {
		let p : Packet = Packet.decode(pm.encode());
		expect(p.toString()).toBe("PacketChat[Hi there, how the heck have you been?]");
		expect(p.id).toBe(PacketTypes.PACKET_CHAT);
	});
	it("errors", () => {
		// invalid packet data, this one is missing the y value
		expect(() => Packet.decode('i1i23')).toThrowError("Invalid char NaN at position 5");
		// invalid packet data, this one has a null for the y value
		expect(() => Packet.decode('i1i23n')).toThrowError("Not an int. Got null which is a typeof object");
	});
});