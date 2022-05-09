import "jasmine"
import {Serializer, Unserializer} from "../../src";
import {EnumTest, EnumVariant} from "../packet/EnumTest";

describe("Enum", () => {
    Unserializer.registerSerializableEnum(EnumTest);

    it("Serialize/Unserialize by index", () => {
        const e = new EnumVariant("1", "2")
        let S = new Serializer();
        S.useEnumIndex = true;
        S.serialize(e);
        let str = S.toString();
        let U = new Unserializer(str);
        const e2: EnumVariant = U.unserialize()
        expect(e.param1).toBe(e2.param1);
        expect(e.param2).toBe(e2.param2);
    });

    it("Serialize/Unserialize by name", () => {
        const e = new EnumVariant("1", "2")
        let S = new Serializer();
        S.useEnumIndex = false;
        S.serialize(e);
        let str = S.toString();
        let U = new Unserializer(str);
        const e2: EnumVariant = U.unserialize()
        expect(e.param1).toBe(e2.param1);
        expect(e.param2).toBe(e2.param2);
    });

    it("tmp", () => {
        const e = [0,1]
        let S = new Serializer();
        S.useEnumIndex = false;
        S.serialize(e);
        let str = S.toString();
        let U = new Unserializer(str);
        const e2 = U.unserialize()
    });
});