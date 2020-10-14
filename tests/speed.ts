import { Serializer } from '../src/Serializer';
import { Unserializer } from '../src/Unserializer';
import { HrTimer, HrTimerValue } from './HrTimer';
import testHeader from './testHeader';
import { Packet, PacketChat, PacketMotion, PacketMove, PacketMoveCustom } from './packet/packets';

let msgpack = require("msgpack-lite");

let doTests = {
	"msgpack": true,
	"qwkpkt": true,
	"Class": true,
	"object": true
}

function getInt(v: any): number {
	if (typeof v === 'number')
		return isNaN(v) ? v : Math.floor(v);
	throw new Error(`Not an int. Got ${v} which is a typeof ` + typeof v);
}


// the timer
let hr = new HrTimer();


// and the fun begins

function justSerialize(v: any) {
	let S = new Serializer();
	S.serialize(v);
	return S.toString();
}
interface Result {
	name: string,
	time: HrTimerValue
}
function displayTimeResults(results: Array<Result>) {
	results.sort((a, b) => {
		let timeA = (a.time.ms / 1000) + a.time.seconds;
		let timeB = (b.time.ms / 1000) + b.time.seconds;
		if (timeA === timeB)
			return 0;
		return timeA < timeB ? 1 : -1;
	});
	let worstTime = (results[0].time.ms / 1000) + results[0].time.seconds;
	worstTime = Math.floor(worstTime * 1000) / 1000;
	for (let i = 0; i < results.length; i++) {
		let res = results[i];
		let time = (res.time.ms / 1000) + res.time.seconds;
		time = Math.floor(time * 1000) / 1000;
		let factor = Math.floor(worstTime / time * 100) / 100;
		let strTime = String(time);
		strTime += "0".repeat(5 - strTime.length);
		let output = `${res.name}\t: ${strTime}s\t${factor}` + (i === 0 ? "" : " x faster")
		console.log(output);
	}
}

function testEncodeClass(encodeLoops:number, pkt : Packet) : Result {
	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			let S = new Serializer();
			S.serialize(pkt);
			S.toString();
		}
	});
	return { name: "qwkclas", time: res };
}

function testDecodeClass(encodeLoops:number, pkt:Packet) {
	let S = new Serializer();
	S.serialize(pkt);
	let enc = S.toString();

	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			let U = new Unserializer(enc);
			let c = U.unserialize();
		}
	});
	return { name: "qwkclas", time: res };
}

function testEncodeQwkpkt(encodeLoops:number, pkt:Packet) {
	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			pkt.encode();
		}
	});
	return { name: "qwkpkt", time: res };
}

function testDecodeqwkpkt(encodeLoops:number, pkt:Packet) {
	let h = pkt.encode();

	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			Packet.decode(h);
		}
	});
	return { name: "qwkpkt", time: res };
}

function testEncodeMsgpack(encodeLoops:number, pkt:Packet) : Result {
	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			// messages usually come from classes (like Player) and the 
			// network data has to be created each time (the JSON etc.)
			// so this simulates that
			let json = pkt.toJSON(); 
			msgpack.encode(json)
		}
	});
	return { name: "msgpack", time: res };
}

// to be fair, the msgpack version should simulate 
// the haxe version by type checking the 
// values and creating a new object, which we
// do here through reflection, although
// we can't do type checking
function testDecodeMsgpack(encodeLoops:number, pkt:Packet) : Result {
	let h = pkt.encode();
	let mp: Buffer = msgpack.encode(pkt.toJSON());
	let d: any = null;
	let ownFields = Reflect.ownKeys(pkt);
	let fields : Array<string> = [];
	ownFields.forEach(key => {
		if(key !== "fields" && typeof key === 'string') {
			fields.push(key);
		}
	});
	// console.log(fields);

	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			d = JSON.parse(msgpack.decode(mp));
			let o: any = {};
			fields.forEach(key => {
				o[key] = d[key];
				// o['x'] = getInt(d['x']);
				// o['y'] = getInt(d['y']);
			});
		}
	});
	return { name: "msgpack", time: res };
}

function testEncodeObject(encodeLoops:number, pkt:Packet) {
	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			let json = pkt.toJSON();
			let S = new Serializer();
			S.serialize(json);
			S.toString();
		}
	});
	return { name: "qwkobj", time: res };
}

function testDecodeObject(encodeLoops:number, pkt:Packet) {
	let S = new Serializer();
	S.serialize(pkt.toJSON());
	let enc = S.toString();

	let res = hr.timeIt(() => {
		for (let i = 0; i < encodeLoops; i++) {
			let U = new Unserializer(enc);
			let c = U.unserialize();
		}
	});
	return { name: "qwkobj", time: res };
}

function runEncodeTimeTests(encodeLoops:number, pkt:Packet) {
	let results: Array<Result> = [];

	// the full-class version
	if (doTests.Class) 
		results.push(testEncodeClass(encodeLoops, pkt));

	// the msgpack version
	if (doTests.msgpack) 
		results.push(testEncodeMsgpack(encodeLoops, pkt));

	// the object only version
	if (doTests.object) 
		results.push(testEncodeObject(encodeLoops, pkt));

	// the self-declared member variable version
	if (doTests.qwkpkt) 
		results.push(testEncodeQwkpkt(encodeLoops, pkt));

	return results;
}

function runDecodeTimeTests(encodeLoops:number, pkt:Packet) {
	let results: Array<Result> = [];

	// the full-class version
	if (doTests.Class) 
		results.push(testDecodeClass(encodeLoops, pkt));

	// the msgpack version
	if (doTests.msgpack) 
		results.push(testDecodeMsgpack(encodeLoops, pkt));

	// the object only version
	if (doTests.object) 
		results.push(testDecodeObject(encodeLoops, pkt));

	// the self-declared member variable version
	if (doTests.qwkpkt) 
		results.push(testDecodeqwkpkt(encodeLoops, pkt));

	return results;
}

function speed(name: string, pkt:Packet) {
	let results: Array<Result> = [];
	let res;
	

	// Encoding speed test
	const encodeLoops = 1000000;
	testHeader(name + " Encoding " + encodeLoops + " times");
	displayTimeResults(runEncodeTimeTests(encodeLoops, pkt));


	// Decoding speed test
	
	testHeader(name + " Decoding " + encodeLoops + " times");
	displayTimeResults(runDecodeTimeTests(encodeLoops, pkt));
}

function size(name:string, pkt:Packet) {
	// encoding length test
	testHeader(name + " Encoded Packet Length");
	let results : Array<{name:string, size:number}> = [];
	if(doTests.qwkpkt) {
		results.push({
			name: "qwkpkt",
			size: pkt.encode().length
		})
	}
	if(doTests.msgpack) {
		results.push({
			name: "msgpack",
			size: msgpack.encode(pkt.toJSON()).length
		})
	}
	if(doTests.object) {
		let S = new Serializer();
		S.serialize(pkt.toJSON());
		results.push({
			name: "qwkobj",
			size: S.toString().length
		})
	}
	if(doTests.Class) {
		let S = new Serializer();
		S.serialize(pkt);
		results.push({
			name: "qwkclas",
			size: S.toString().length
		})
	}
	results.sort((a,b) => {
		if (a.size === b.size)
			return 0;
		return a.size < b.size ? 1 : -1;
	});

	let worstSize = results[0].size;
	for (let i = 0; i < results.length; i++) {
		let res = results[i];
		let factor = Math.floor(worstSize / res.size * 100) / 100;
		let strSize = String(res.size);
		//strSize += "0".repeat(5 - strSize.length);
		let output;
		if(i != 0 && res.size === worstSize) 
			output = `${res.name}\t: ${strSize} bytes\tsame size`;
		else
			output = `${res.name}\t: ${strSize} bytes\t${factor}` + (i === 0 ? "" : " x smaller")
		console.log(output);
	}

	return results;

	// console.log("msgpack: " + msgpack.encode(pkt.toJSON()).length);
	// console.log("qwkpkt:    " + pkt.encode().length);
}

Unserializer.registerSerializableClass(PacketMove);
Unserializer.registerSerializableClass(PacketMoveCustom);
Unserializer.registerSerializableClass(PacketChat);
Unserializer.registerSerializableClass(PacketMotion);
// the packets
let p : Packet = new PacketMove(23, 45);
speed("PacketMove", p);
size("PacketMove", p);

p = new PacketMoveCustom(23, 45);
speed("PacketMoveCustom", p);
size("PacketMoveCustom", p);

p = new PacketChat("Hi there, what is your name?");
speed("PacketChat", p);
size("PacketChat", p);

p = new PacketMotion();
speed("PacketMotion", p);
size("PacketMotion", p);

console.log("");
console.log("");