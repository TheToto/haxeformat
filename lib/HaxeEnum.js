"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenericHaxeEnum = exports.HaxeEnum = void 0;
var HaxeEnum = (function () {
    function HaxeEnum() {
    }
    HaxeEnum.getEnumConstructs = function () {
        throw new Error("getEnumConstructs must be implemented");
    };
    HaxeEnum.prototype.getParams = function () {
        throw new Error("getParams must be implemented");
    };
    HaxeEnum.enum = "Unimplemented";
    HaxeEnum.tag = "Unimplemented";
    return HaxeEnum;
}());
exports.HaxeEnum = HaxeEnum;
function createGenericHaxeEnum(name, tag, args) {
    var genericEnum = Object.create(HaxeEnum.prototype);
    genericEnum.constructor.enum = name;
    genericEnum.constructor.tag = tag;
    Object.defineProperty(genericEnum.constructor, "getEnumConstructs", {
        value: function () {
            if (typeof tag === "number") {
                var c = new Array(tag + 1).fill({});
                c[tag] = { tag: tag };
                return c;
            }
            return [];
        },
    });
    genericEnum["getParams"] = function () { return args; };
    genericEnum["args"] = args;
    return genericEnum;
}
exports.createGenericHaxeEnum = createGenericHaxeEnum;
//# sourceMappingURL=HaxeEnum.js.map