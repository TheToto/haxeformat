"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaxeEnum = void 0;
var HaxeEnum = (function () {
    function HaxeEnum() {
    }
    Object.defineProperty(HaxeEnum, "enum", {
        get: function () {
            throw new Error('get enum must be implemented');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HaxeEnum, "tag", {
        get: function () {
            throw new Error('get tag must be implemented');
        },
        enumerable: false,
        configurable: true
    });
    HaxeEnum.getEnumConstructs = function () {
        throw new Error('getEnumConstructs must be implemented');
    };
    HaxeEnum.prototype.getParams = function () {
        throw new Error('getParams must be implemented');
    };
    return HaxeEnum;
}());
exports.HaxeEnum = HaxeEnum;
//# sourceMappingURL=HaxeEnum.js.map