export abstract class HaxeEnum {
    // Following static members must be implemented
    static readonly enum: string = "Unimplemented"
    static readonly tag: string = "Unimplemented"

    static getEnumConstructs(): any[]{
        throw new Error('getEnumConstructs must be implemented');
    }

    getParams(): any[]{
        throw new Error('getParams must be implemented');
    }
}