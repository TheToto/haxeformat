import { Packet, PacketTypes } from "./Packet";

export class PacketChat extends Packet {
	public text: string = "";

	constructor(text:string = "") {
		super(PacketTypes.PACKET_CHAT, ['text']);
		this.text = text;
	}

	toJSON() {
		return super.toJSON();
	}

	encode() {
		return super.encode();
	}

	protected fromObj(obj:{[key:string]:any}) {
		this.text = this.getString(obj.text);
		return this;
	}

	toString() {
		return `PacketChat[${this.text?.toString()}]`;
	}
}

Packet.register(PacketTypes.PACKET_CHAT, PacketChat);