import { Packet, PacketTypes } from "./Packet";
import { Serializer } from "../../src/Serializer";
import { Unserializer } from "../../src/Unserializer";
/**
 * This class
 */
export class PacketMoveCustom extends Packet {
	public x: number = 0;
	public y: number = 0;

	constructor(x: number = -420, y: number = 0) {
		super(PacketTypes.PACKET_MOVE_CUSTOM, ['x', 'y']);
		this.x = x;
		this.y = y;
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
		return this;
	}

	toString() {
		return `PacketMoveCustom[${this.x}, ${this.y}]`;
	}

	/**
	 * The serializer and Unserializer will ignore the 'private'
	 * or 'protected' modifiers on _qwkpktEncode and _qwkpktEncode.
	 * In order to ensure code comletion doesn't keep popping up
	 * with these as suggestions for your class, making them
	 * protect or private is a really good idea.
	 * @param S 
	 */
	private _qwkpktEncode(S: Serializer) {
		S.serialize(this.id);
		S.serialize(this.x);
		S.serialize(this.y);
	}

	private _qwkpktDecode(U: Unserializer) {
		// when this method is called, the current instance
		// of this class has not had its constructor called,
		// it is an "empty" instance. So this code does not
		// work:
		// let i = U.unserialize();
		// if(this.id !== i) {
		// 	throw new Error(`Bad id received ${i} vs. ${this.id}`);
		// }

		// And of course, you will have to do any other initialization
		// that would have otherwise been done in the constructor, like:
		// this.fields = ['x', 'y'];
		// which are not a part of the serialization

		// then you can continue on your way

		// However, being an empty instance does make it that members 
		// that *should* be readonly (like id and fields in this example) 
		// are not able to be so, unless you do other tricks like @ts-ignore
		// @ts-ignore
		this.id = U.unserialize();
		// or using Reflect
		Reflect.set(this, "fields", ['x', 'y']);
		
		this.x = U.unserialize();
		this.y = U.unserialize();
	}
}

Packet.register(PacketTypes.PACKET_MOVE_CUSTOM, PacketMoveCustom);