"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaxeException = void 0;
var HaxeException = (function (_super) {
    __extends(HaxeException, _super);
    function HaxeException(data) {
        var _this = _super.call(this, "Haxe Exception: " + data) || this;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, HaxeException);
        }
        _this.name = 'HaxeException';
        _this.data = data;
        return _this;
    }
    return HaxeException;
}(Error));
exports.HaxeException = HaxeException;
//# sourceMappingURL=HaxeException.js.map