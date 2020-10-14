import { Packet, PacketTypes } from "./Packet";

export class PacketMove extends Packet {
	public x: number = 0;
	public y: number = 0;

	constructor(x:number=-420, y:number=0) {
		super(PacketTypes.PACKET_MOVE, ['x', 'y']);
		this.x = x;
		this.y = y;
	}

	toJSON() {
		return super.toJSON();
	}

	encode() {
		return super.encode();
	}

	protected fromObj(obj:{[key:string]:any}) {
		this.x = this.getInt(obj.x);
		this.y = this.getInt(obj.y);
		return this;
	}

	toString() {
		return `PacketMove[${this.x}, ${this.y}]`;
	}
}

Packet.register(PacketTypes.PACKET_MOVE, PacketMove);