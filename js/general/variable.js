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
var Variable = /** @class */ (function (_super) {
    __extends(Variable, _super);
    function Variable(name, type) {
        var _this = _super.call(this, 1) || this;
        _this.resourceIdentifier = "Variable";
        _this._name = name;
        _this._type = type;
        return _this;
    }
    Variable.prototype["default"] = function (v) {
        this._default = v;
        return this;
    };
    Variable.prototype.description = function (text) {
        this._description = text;
        return this;
    };
    Variable.prototype.checkValid = function () {
        return {};
    };
    Variable.prototype.prepareQueue = function (mod, param) {
        mod[general_1.generationQueue].variables[this._name] = this;
    };
    Variable.prototype.generateObject = function () {
        return {
            type: this._type,
            "default": this._default,
            description: this._description
        };
    };
    Variable.prototype.generateString = function () {
        return "${var." + this._name + "}";
    };
    Variable.prototype.getName = function (par) {
        return this._name;
    };
    return Variable;
}(field_1.AdvField));
exports.Variable = Variable;
var Output = /** @class */ (function (_super) {
    __extends(Output, _super);
    function Output(name, value) {
        var _this = _super.call(this, 1) || this;
        _this.resourceIdentifier = "Output";
        _this._dependsOn = [];
        _this._name = name;
        _this._value = value;
        return _this;
    }
    Output.prototype.description = function (text) {
        this._description = text;
        return this;
    };
    Output.prototype.sensitive = function (bool) {
        if (bool === void 0) { bool = true; }
        this._sensitive = bool;
        return this;
    };
    Output.prototype.dependsOn = function () {
        var _a;
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        (_a = this._dependsOn).push.apply(_a, fields);
        return this;
    };
    Output.prototype.checkValid = function () {
        return lodash_1["default"].assign.apply(lodash_1["default"], [{}].concat(lodash_1["default"](this)
            .filter(function (_v, k) { return k.startsWith("_"); })
            .flatMap(function (v) { return general_1.callFieldReferences(v[1], function (v) { return v[general_1.checkValid](); }); })
            .value()));
    };
    Output.prototype.prepareQueue = function (mod, param) {
        mod[general_1.generationQueue].outputs[this._name] = this;
        lodash_1["default"](this)
            .filter(function (_v, k) { return k.startsWith("_"); })
            .forEach(function (v) { return general_1.callFieldReferences(v[1], function (v) { return v[general_1.prepareQueue](mod, param); }); });
    };
    Output.prototype.generateObject = function () {
        return {
            value: this._value,
            sensitive: this._sensitive,
            description: this._description,
            dependsOn: this._dependsOn.length ? this._dependsOn : undefined
        };
    };
    return Output;
}(general_1.Generatable));
exports.Output = Output;
var Local = /** @class */ (function (_super) {
    __extends(Local, _super);
    function Local(name, value) {
        var _this = _super.call(this, 1) || this;
        _this.resourceIdentifier = "Local";
        _this._name = name;
        _this._value = value;
        return _this;
    }
    Local.prototype.generateString = function () {
        return "${local." + this._name + "}";
    };
    Local.prototype.getName = function (par) {
        return this._name;
    };
    Local.prototype.checkValid = function () {
        return lodash_1["default"].assign.apply(lodash_1["default"], [{}].concat(general_1.callFieldReferences(this._value, function (v) { return v[general_1.checkValid](); })));
    };
    Local.prototype.prepareQueue = function (mod, param) {
        mod[general_1.generationQueue].locals[this._name] = this;
        general_1.callFieldReferences(this._value, function (v) { return v[general_1.prepareQueue](mod, param); });
    };
    Local.prototype.generateObject = function () {
        return this._value;
    };
    return Local;
}(field_1.AdvField));
exports.Local = Local;
