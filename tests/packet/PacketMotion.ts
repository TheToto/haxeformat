import { Packet } from "../../src/Packet";
import { PacketTypes } from "./PacketTypes";

export class PacketMotion extends Packet {
	public x: number = 0;
	public y: number = 0;
	public direction: number = 0.0;
	public speed: number = 0.0;

	constructor(x: number = -420, y: number = 0, dir: number = 3.14, speed: number = 0.85) {
		super(PacketTypes.PACKET_MOTION, ['x', 'y', 'direction', 'speed']);
		this.x = x;
		this.y = y;
		this.direction = dir;
		this.speed = speed;
	}

	toJSON() {
		return super.toJSON();
	}

	encode() {
		return super.encode();
	}

	protected fromObj(obj: { [key: string]: any }) {
		this.x = this.getInt(obj.x);
		this.y = this.getInt(obj.y);
		this.direction = this.getFloat(obj.direction);
		this.speed = this.getFloat(obj.speed);
		return this;
	}

	toString() {
		return `PacketMotion[${this.x}, ${this.y}, ${this.direction}, ${this.speed}]`;
	}
}

Packet.register(PacketTypes.PACKET_MOTION, PacketMotion);