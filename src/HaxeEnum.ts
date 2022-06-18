export abstract class HaxeEnum {
    static get enum(): string {
        throw new Error('get enum must be implemented');
    }
    static get tag(): string {
        throw new Error('get tag must be implemented');
    }

    static getEnumConstructs(): any[]{
        throw new Error('getEnumConstructs must be implemented');
    }

    getParams(): any[]{
        throw new Error('getParams must be implemented');
    }
}