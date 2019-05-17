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
var _a;
var general_1 = require("./general");
var lodash_1 = require("lodash");
var Resource = /** @class */ (function (_super) {
    __extends(Resource, _super);
    function Resource() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this[_a] = {};
        return _this;
    }
    Resource.prototype.alias = function (alias) {
        this.__alias = alias;
        return this;
    };
    Resource.prototype.injectDependencies = function (dep) { };
    Resource.prototype[(_a = general_1.generationQueue, general_1.prepareQueue)] = function (mod, par) {
        var _a;
        var name = this[general_1.getName](par);
        if (this[general_1.generationQueue][name] === undefined) {
            this[general_1.generationQueue][name] = par;
            lodash_1["default"].defaults(mod[general_1.generationQueue].resources, (_a = {}, _a[this.resourceIdentifier] = [], _a))[this.resourceIdentifier][name] = this;
            this.prepareQueue(mod, par);
            lodash_1["default"](this)
                .filter(function (_v, k) { return k.startsWith("_") || k.startsWith("$"); })
                .forEach(function (v) { return general_1.callFieldReferences(v, function (v) { return v[general_1.prepareQueue](mod, par); }); });
        }
        else {
            console.log("yo");
        }
    };
    Resource.prototype[general_1.checkValid] = function () {
        if (this.checkCache) {
            console.log(this.checkCache);
            return this.checkCache;
        }
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
            .filter(function (_v, k) { return k.startsWith("_") || k.startsWith("$"); })
            .flatMap(function (v) { return general_1.callFieldReferences(v, function (v) { return v[general_1.checkValid](); }); })
            .value()));
        return this.checkCache = out;
    };
    Resource.prototype[general_1.getName] = function (par) {
        this.injectDependencies(par);
        if (this.__alias) {
            return this.__alias;
        }
        else {
            var x = this.generateName();
            // console.log(x)
            return x;
        }
    };
    Resource.prototype[general_1.generateObject] = function (name) {
        this.injectDependencies(this[general_1.generationQueue][name]);
        return this.generateObject();
    };
    Resource.prototype[general_1.getRef] = function (par) {
        return this.resourceIdentifier + "." + this[general_1.getName](par);
    };
    return Resource;
}(general_1.Generatable));
exports.Resource = Resource;
