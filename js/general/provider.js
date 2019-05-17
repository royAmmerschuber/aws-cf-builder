"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var general_1 = require("./general");
var lodash_1 = require("lodash");
var Provider = /** @class */ (function (_super) {
    __extends(Provider, _super);
    //#endregion
    function Provider(errorDepth) {
        return _super.call(this, errorDepth + 1) || this;
    }
    //#region simple properties
    Provider.prototype.alias = function (alias) {
        this._alias = alias;
        return this;
    };
    Provider.prototype.version = function (version) {
        this._version = version;
        return this;
    };
    //#endregion
    //#region resource functions
    Provider.prototype[general_1.prepareQueue] = function (mod, param) {
        var _a;
        if (!this.prepared) {
            this.prepared = true;
            lodash_1["default"].defaults(mod[general_1.generationQueue].providers, (_a = {}, _a[this.resourceIdentifier] = [], _a))[this.resourceIdentifier].push(this);
            this.prepareQueue(mod, param);
        }
    };
    Provider.prototype[general_1.generateObject] = function () {
        var out = this.generateObject();
        return lodash_1["default"].assign(out, {
            alias: this._alias,
            version: this._version
        });
    };
    return Provider;
}(general_1.Generatable));
exports.Provider = Provider;
