export declare class HaxeEnum {
    name: string;
    tag: string;
    constructor(name: string, tag: string);
    static getEnumConstructs(): (typeof HaxeEnum)[];
    getParams(): any[];
}
