import { Serializer } from '../../src/Serializer';
import { Unserializer } from '../../src/Unserializer';

// https://levelup.gitconnected.com/building-type-safe-dictionaries-in-typescript-a072d750cbdf

export enum PacketTypes {
	PACKET_MOVE = 1,
	PACKET_CHAT,
	PACKET_MOTION,
	PACKET_MOVE_CUSTOM
}

export abstract class Packet {
	private static registry: Record<number, new () => Packet> = {};

	/**
	 * Must be called by all pakect types after the class definition
	 * @param id The packet id must be unique for each packet class
	 * @param classRef the class constructor. Usually just the name of the class
	 */
	static register(id: number, classRef: new () => Packet) {
		if (Packet.registry[id])
			throw new Error(`A packet with id ${id} has already been registered`);
		Packet.registry[id] = classRef;
	}

	static decode(str:string) : Packet {
		let uns = new Unserializer(str);
		let msgId = uns.unserialize();
		// console.log(`Got ${msgId}`);
		if(typeof msgId !== 'number')
			throw new Error(`packet msgId '${msgId}' was a ` + typeof msgId);
		msgId = Math.floor(msgId);
		if(!Packet.registry[msgId])
			throw new Error(`No packet registered for packet id ${msgId}`);
		let p = new Packet.registry[msgId]();
		// console.log(p);
		let fields = p.fields;
		let obj : {[idx:string]:any}= {};
		for(let i=0; i<fields.length; i++) {
			let key = fields[i];
			let data = uns.unserialize();
			obj[key] = data;
		}
		return p.fromObj(obj);
	}	

	public readonly id: number;
	protected readonly fields: Array<string>;

	constructor(id: number, fields: Array<string> /*(keyof Packet)[]*/) {
		this.id = id;
		this.fields = fields;
	}

	/**
	 * Test that the fields all exist
	 */
	public test() {
		this.fields.forEach(element => {
			if(!this.hasOwnProperty(element)) {
				throw new Error(`Field '${element}' does not exist`);
			}
			// @ts-ignore
			let type = typeof this[element];
			if(type === 'function' || type === 'undefined') {
				throw new Error(`Invalid field type '${type}' for field '${element}'`);
			}
		});
	}

	/**
	 * Packet.decode will call this method with an object after unserializing 
	 * the data. The fields are guaranteed to only be the fields passed in 
	 * during the constructor. You should use methods like {@link getInt}
	 * or {@link getString} to ensure the unserialized data is the correct type.
	 * 
	 * @param obj Object with keys and values
	 * @returns The packet should return itself for chaining
	 */
	protected abstract fromObj(obj: { [key: string]: any }): Packet;
	
	/**
	 * All packets must implement a toString, which is useful for debugging.
	 * @returns Arbitray string value representing the packet
	 */
	public abstract toString() : string;

	/**
	 * Returns a json version of this packet
	 */
	public toJSON() : string {
		let obj: any = { id: this.id };
		for (let i = 0; i < this.fields.length; i++) {
			let f = this.fields[i];
			// @ts-ignore
			obj[f] = this[f];
		}
		return JSON.stringify(obj);
	}

	public encode() {
		let ser = new Serializer();
		ser.serialize(this.id);
		for (let i = 0; i < this.fields.length; i++) {
			// @ts-ignore
			ser.serialize(this[this.fields[i]]);
		}
		return ser.toString();
	}

	/**
	 * 
	 * @param v Hopefully a number from 
	 */
	protected getInt(v: any): number {
		// console.log(`getInt ${v} ` + typeof v);
		if(typeof v === 'number')
			return isNaN(v) ? v : Math.floor(v);
		throw new Error(`Not an int. Got ${v} which is a typeof ` + typeof v);
	}

	protected getFloat(v:string): number {
		if(typeof v === 'number')
			return v;
		throw new Error(`Not a float. Got ${v} which is a typeof ` + typeof v);
	}

	protected getString(v:any) : string {
		if(typeof v === 'string')
			return v;
		throw new Error(`Not a string. Got ${v} which is a typeof ` + typeof v);
	}

	protected getBuffer(v:any) : Buffer {
		if(typeof v === 'object')
			return v.getData();
		throw new Error(`Not a string. Got ${v} which is a typeof ` + typeof v);
	}
}

//https://www.typescriptlang.org/docs/handbook/2/classes.html#this-types