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
var field_1 = require("./field");
var lodash_1 = require("lodash");
var DataSource = /** @class */ (function (_super) {
    __extends(DataSource, _super);
    function DataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSource.prototype.alias = function (alias) {
        this.__alias = alias;
        return this;
    };
    DataSource.prototype[general_1.prepareQueue] = function (mod, par) {
        var _a;
        var name = this[general_1.getName](par);
        if (!this.isPrepared) {
            lodash_1["default"].defaults(mod[general_1.generationQueue].dataSources, (_a = {}, _a[this.resourceIdentifier] = [], _a))[this.resourceIdentifier][name] = this;
            this.prepareQueue(mod, par);
            lodash_1["default"](this)
                .entries()
                .filter(function (v) { return v[0].startsWith("_") && v[1] instanceof field_1.AdvField; })
                .forEach(function (v) { return v[1][general_1.prepareQueue](mod, par); });
            this.isPrepared = true;
        }
    };
    DataSource.prototype[general_1.checkValid] = function () {
        if (this.checkCache)
            return this.checkCache;
        var out = this.checkValid();
        var errors = [];
        if (this.stacktrace in out) {
            errors = out[this.stacktrace].errors;
        }
        if (errors.length && !(this.stacktrace in out)) {
            out[this.stacktrace] = {
                errors: errors,
                type: this.resourceIdentifier
            };
        }
        lodash_1["default"].assign.apply(lodash_1["default"], [out].concat(lodash_1["default"](this)
            .entries()
            .filter(function (v) { return v[0].startsWith("_") && v[1] instanceof field_1.AdvField; })
            .map(function (v) { return v[1][general_1.checkValid](); })
            .value()));
        return this.checkCache = out;
    };
    DataSource.prototype[general_1.getName] = function (par) {
        if (this.__alias) {
            return this.__alias;
        }
        else {
            return this.generateName(par);
        }
    };
    DataSource.prototype[general_1.getRef] = function (par) {
        return this.resourceIdentifier + "." + this[general_1.getName](par);
    };
    return DataSource;
}(general_1.Generatable));
exports.DataSource = DataSource;
