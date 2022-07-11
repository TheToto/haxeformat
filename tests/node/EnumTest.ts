import {HaxeEnum} from "../../src/HaxeEnum";

export abstract class EnumTest extends HaxeEnum {
    static get enum() { return  "EnumTest"; }

    static getEnumConstructs() {
        return [EnumVariant];
    }
}

export class EnumVariant extends EnumTest {
    static get tag() { return  "EnumVariant"; }

    param1: string
    param2: string

    constructor(param1: string, param2: string) {
        super();
        this.param1 = param1;
        this.param2 = param2;
    }

    getParams() {
        return [this.param1, this.param2];
    }
}