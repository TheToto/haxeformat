import "jasmine"
import { Serializer } from '../../src/Serializer';
import { Unserializer } from '../../src/Unserializer';
import {HaxeException} from "../../src";

function unserializeAndSerialize(serialized: string, useEnumIndex: boolean = false) {
    let U = new Unserializer(serialized);
    U.allowUnregistered = true;
    let v = U.unserialize();
    let S = new Serializer();
    S.useEnumIndex = useEnumIndex;
    S.serialize(v);
    return S.toString()
}

function testHaxeCompatible(name: string, hx: string, useEnumIndex: boolean = false) {
    it(name, () => {
        expect(unserializeAndSerialize(hx, useEnumIndex)).toBe(hx)
    })
}

describe("HaxeCompatible", () => {
    testHaxeCompatible("null", "n")
    testHaxeCompatible("Int (zero)", "z")
    testHaxeCompatible("Int", "i456")
    testHaxeCompatible("Float", "d1.45e-8")
    testHaxeCompatible("Float (NaN)", "k")
    testHaxeCompatible("Float (-Infinity)", "m")
    testHaxeCompatible("Float (+Infinity)", "p")
    testHaxeCompatible("Bool (true)", "t")
    testHaxeCompatible("Bool (false)", "f")
    testHaxeCompatible("String", "y10:hi%20there")
    testHaxeCompatible("Structure", "oy1:xi2y1:kng")
    testHaxeCompatible("List", "lnnh")
    testHaxeCompatible("Array", "ai1i2u4i7ni9h")
    testHaxeCompatible("Date", "v2010-01-01 12:45:10")
    testHaxeCompatible("haxe.ds.StringMap", "by1:xi2y1:knh")
    testHaxeCompatible("haxe.ds.IntMap", "q:4n:5i45:6i7h")
    testHaxeCompatible("haxe.ds.ObjectMap", "Moy3:fooy6:fooKeygoy3:bary8:barValuegh")
    testHaxeCompatible("haxe.io.Bytes", "s10:SGVsbG8gIQ")
    testHaxeCompatible("Class", "cy5:Pointy1:xzy1:yzg")
    testHaxeCompatible("Enum (index)", "jy3:Foo:0:0", true)
    testHaxeCompatible("Enum (names)", "wy3:Fooy1:A:0")

    it("Exception", () => {
        let hx = "xy10:hi%20there" // => new HaxeException("hi there")
        let U = new Unserializer(hx);
        try {
            U.unserialize()
            expect(false).toBe(true)
        } catch (e) {
            expect(e.name).toBe("HaxeException")
            let S = new Serializer();
            S.serialize(new HaxeException(e.data));
            expect(S.toString()).toBe(hx)
        }
    })
});