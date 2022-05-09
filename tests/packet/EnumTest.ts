import {HaxeEnum} from "../../src/HaxeEnum";

export class EnumTest extends HaxeEnum {
    constructor(tag: string) {
        super("EnumTest", tag);
    }

    static getEnumConstructs() {
        return [EnumVariant]
    }
}

export class EnumVariant extends EnumTest {
    param1: string
    param2: string

    constructor(param1: string, param2: string) {
        super("EnumVariant");
        this.param1 = param1;
        this.param2 = param2;
    }

    getParams() {
        return [this.param1, this.param2]
    }
}
