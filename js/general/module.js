"use strict";
exports.__esModule = true;
var _a;
var resource_1 = require("./resource");
var dataSource_1 = require("./dataSource");
var general_1 = require("./general");
var lodash_1 = require("lodash");
var chalk_1 = require("chalk");
var Module = /** @class */ (function () {
    function Module(name) {
        if (name === void 0) { name = "main"; }
        this.name = name;
        this[_a] = {
            providers: {},
            resources: {},
            dataSources: {},
            variables: {},
            outputs: {},
            locals: {}
        };
        this._providers = [];
        this._resources = [];
        this._outputs = [];
    }
    Module.prototype.providers = function () {
        var _a;
        var providers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            providers[_i] = arguments[_i];
        }
        (_a = this._providers).push.apply(_a, providers);
        return this;
    };
    Module.prototype.outputs = function () {
        var _a;
        var outputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            outputs[_i] = arguments[_i];
        }
        (_a = this._outputs).push.apply(_a, outputs);
        return this;
    };
    Module.prototype.resources = function () {
        var _this = this;
        var resources = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            resources[_i] = arguments[_i];
        }
        resources.forEach(function (v) {
            if (v instanceof resource_1.Resource || v instanceof dataSource_1.DataSource) {
                _this._resources.push(v);
            }
            else if (v instanceof Array) {
                _this.resources.apply(_this, v);
            }
            else {
                _this.resources.apply(_this, lodash_1["default"].values(v));
            }
        });
        return this;
    };
    Module.prototype.generate = function () {
        this.check();
        this.prepareQueue();
        return this.generateObject();
    };
    Module.prototype.check = function () {
        var errors = {};
        lodash_1["default"].assign.apply(lodash_1["default"], [errors].concat(lodash_1["default"].flatMap([
            this._providers,
            this._resources,
            this._outputs
        ], function (v) { return v.map(function (v) { return v[general_1.checkValid](); }); })));
        if (lodash_1["default"].size(errors)) {
            var out_1 = "";
            lodash_1["default"].forOwn(errors, function (v, k) {
                out_1 += chalk_1["default"].yellow(v.type) + "\n";
                out_1 += k + "\n";
                v.errors.forEach(function (v) { return out_1 += "    " + v + "\n"; });
            });
            throw new Error(out_1);
        }
    };
    Module.prototype.prepareQueue = function () {
        var _this = this;
        [
            this._providers,
            this._resources,
            this._outputs
        ].forEach(function (v) { return v.forEach(function (v) { return v[general_1.prepareQueue](_this, {}); }); });
    };
    Module.prototype.generateObject = function () {
        var gq = this[general_1.generationQueue];
        return {
            variable: lodash_1["default"].size(gq.variables) ? lodash_1["default"].mapValues(gq.variables, function (v, k) { return v[general_1.generateObject](k); }) : undefined,
            locals: lodash_1["default"].size(gq.locals) ? lodash_1["default"].mapValues(gq.locals, function (v, k) { return v[general_1.generateObject](k); }) : undefined,
            provider: lodash_1["default"].size(gq.providers) ? lodash_1["default"].mapValues(gq.providers, function (v) {
                if (v.length == 1) {
                    return v[0][general_1.generateObject]();
                }
                return v.map(function (v) { return v[general_1.generateObject](); });
            }) : undefined,
            datasource: lodash_1["default"].size(gq.dataSources) ? lodash_1["default"].mapValues(gq.dataSources, function (v) { return lodash_1["default"].mapValues(v, function (v, k) { return v[general_1.generateObject](k); }); }) : undefined,
            resource: lodash_1["default"].size(gq.resources) ? lodash_1["default"].mapValues(gq.resources, function (v) { return lodash_1["default"].mapValues(v, function (v, k) { return v[general_1.generateObject](k); }); }) : undefined,
            output: lodash_1["default"].size(gq.outputs) ? lodash_1["default"].mapValues(gq.outputs, function (v, k) { return v[general_1.generateObject](k); }) : undefined
        };
    };
    return Module;
}());
_a = general_1.generationQueue;
exports.Module = Module;
