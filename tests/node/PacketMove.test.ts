// import {describe, it} from 'jasmine';
import "jasmine"
import { Packet, PacketTypes, PacketMove } from '../packet/packets';

describe("PacketMove", () => {
	var pm = new PacketMove(23,45);
	it("toString", ()=> {
		expect(pm.toString()).toBe("PacketMove[23, 45]");
	});
	it("serialized", ()=>{
		expect(pm.encode()).toBe("i1i23i45");
	});
	it("unserialized", () => {
		let p : Packet = Packet.decode(pm.encode());
		expect(p.toString()).toBe("PacketMove[23, 45]");
		expect(p.id).toBe(PacketTypes.PACKET_MOVE);
	});
	it("errors", () => {
		// invalid packet data, this one is missing the y value
		expect(() => Packet.decode('i1i23')).toThrowError("Invalid char NaN at position 5");
		// invalid packet data, this one has a null for the y value
		expect(() => Packet.decode('i1i23n')).toThrowError("Not an int. Got null which is a typeof object");
	});	
});
