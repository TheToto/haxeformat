export class HaxeEnum {
    name: string
    tag: string

    constructor(name: string, tag: string) {
        this.name = name;
        this.tag = tag;
    }

    static getEnumConstructs(): (typeof HaxeEnum)[]{
        throw new Error('getEnumConstructs must be implemented');
    }

    getParams(): any[]{
        throw new Error('getParams must be implemented');
    }
}