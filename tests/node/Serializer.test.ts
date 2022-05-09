import "jasmine"
import { Serializer } from '../../src/Serializer';
import { Unserializer } from '../../src/Unserializer';


function justSerialize(v:any) : string {
	let S = new Serializer();
	S.serialize(v);
	return S.toString();
}

function serializeAndUnserialize(v: any) {
	let S = new Serializer();
	S.serialize(v);
	let sres = S.toString();
	let U = new Unserializer(sres);
	return U.unserialize();
}

describe("Serializer", () => {
	it("does zero", () => {
		expect(justSerialize(0)).toEqual("z");
		expect(serializeAndUnserialize(0)).toEqual(0);
	});

	it("does booleans", () => {
		expect(serializeAndUnserialize(true)).toEqual(true);
		expect(serializeAndUnserialize(false)).toEqual(false);
	});

	it("does integers", () => {
		expect(serializeAndUnserialize(1)).toEqual(1);
		expect(serializeAndUnserialize(12341214)).toEqual(12341214);
	});

	it("does strings", () => {
		let s = "I really like serializing";
		expect(serializeAndUnserialize(s)).toEqual(s);
	});

	it("does weird strings", () => {
		let s1 = "ⒶⒷⒸⒹⒺⒻⒼ";
		let s2 = "𝑨𝑩𝑪𝑫𝑬𝑭𝑮";
		expect(serializeAndUnserialize(s1)).toEqual(s1);
		expect(serializeAndUnserialize(s2)).toEqual(s2);
	});

	it("does floats", () => {
		expect(serializeAndUnserialize(3272664.238)).toEqual(3272664.238);
		expect(serializeAndUnserialize(-23485.341)).toEqual(-23485.341);
	});

	it("does those weird numbers", () => {
		expect(justSerialize(NaN)).toBe("k");
		expect(justSerialize(Number.POSITIVE_INFINITY)).toBe("p");
		expect(justSerialize(Number.NEGATIVE_INFINITY)).toBe("m");
		expect(serializeAndUnserialize(NaN)).toEqual(NaN);
		expect(serializeAndUnserialize(Number.NEGATIVE_INFINITY)).toEqual(Number.NEGATIVE_INFINITY);
		expect(serializeAndUnserialize(Number.POSITIVE_INFINITY)).toEqual(Number.POSITIVE_INFINITY);
	});

	it("does string arrays", () => {
		let s = ['hi', 'there', 'world'];
		expect(justSerialize(s)).toEqual('ay2:hiy5:therey5:worldh');
		expect(serializeAndUnserialize(s)).toEqual(s);
	});

	it("does numeric arrays", () => {
		let s = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
		expect(serializeAndUnserialize(s)).toEqual(s);
	});

	it("does buffers", ()=> {
		let s = "Hello world from the serializer";
		let bytes = Buffer.from(s);
		expect(justSerialize(bytes)).toBe("s42:SGVsbG8gd29ybGQgZnJvbSB0aGUgc2VyaWFsaXplcg");
		expect(serializeAndUnserialize(bytes).toString()).toBe(s);
	});

	it("does dates", () => {
		let d = new Date(1602561002310); // 2020-10-13T03:50:02.310Z
		expect(justSerialize(d)).toBe("v1602561002310");
		expect(serializeAndUnserialize(d).getTime()).toBe(1602561002310);
	});

	it("does objects", () => {
		let s0 = { a:1, b:"string"};
		let s1 = { a: 1, b: "string", c: [1, 2, 3, 4] };
		let s2 = { a: 1, b: "string", c: [1, 2, 3, 4], d: { a:1, b:3} };
		expect(serializeAndUnserialize(s0)).toEqual(s0);
		expect(serializeAndUnserialize(s1)).toEqual(s1);
		expect(serializeAndUnserialize(s2)).toEqual(s2);
	});

	it("even does classes", () => {
		let a = new Apples();
		let serialized = justSerialize(a);
		expect(serialized).toBe("cy6:Applesy5:valuei5g");
		let U = new Unserializer(serialized);
		expect(()=>U.unserialize()).toThrowError();
		// for security, in order to unserialize classes, they must be pre-registered.
		Unserializer.registerSerializableClass(Apples);
		U = new Unserializer(serialized);
		let newA : Apples = U.unserialize();
		expect(newA.value).toBe(5);
	});

	it("will never do functions", () => {
		expect(() => serializeAndUnserialize(justSerialize)).toThrowError();
	});

});

class Apples {
	value: number = 0;
	constructor() { this.value = 5; }
}