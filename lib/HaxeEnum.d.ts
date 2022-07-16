export declare abstract class HaxeEnum {
    static readonly enum: string;
    static readonly tag: string;
    static getEnumConstructs(): any[];
    getParams(): any[];
}
export declare function createGenericHaxeEnum(name: string, tag: string | number, args: any[]): HaxeEnum;
