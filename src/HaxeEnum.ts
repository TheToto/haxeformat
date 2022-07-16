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

export function createGenericHaxeEnum(name:string, tag: string | number, args: any[]): HaxeEnum {
    const genericEnum = Object.create(HaxeEnum.prototype);
    genericEnum.constructor.enum = name;
    genericEnum.constructor.tag = tag;
    Object.defineProperty(genericEnum.constructor, 'getEnumConstructs', {
        value: () => {
            if (typeof tag === "number") {
                const c = new Array(tag + 1).fill({});
                c[tag] = {tag};
                return c
            }
            return []
        }
    });
    genericEnum["getParams"] = () => args
    genericEnum["args"] = args
    return genericEnum
}