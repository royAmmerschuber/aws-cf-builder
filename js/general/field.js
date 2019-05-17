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
var resource_1 = require("./resource");
var general_1 = require("./general");
var AdvField = /** @class */ (function (_super) {
    __extends(AdvField, _super);
    function AdvField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AdvField.prototype.toJSON = function () {
        return this.generateString();
    };
    AdvField.prototype[general_1.prepareQueue] = function (mod, par) {
        this.prepareQueue(mod, par);
    };
    AdvField.prototype[general_1.checkValid] = function () { return this.checkValid(); };
    AdvField.prototype[general_1.getName] = function (par) { return this.getName(par); };
    AdvField.prototype.generateObject = function () {
        return {};
    };
    return AdvField;
}(general_1.Generatable));
exports.AdvField = AdvField;
var ReferenceField = /** @class */ (function (_super) {
    __extends(ReferenceField, _super);
    function ReferenceField(resource, attr) {
        var _this = _super.call(this, 1) || this;
        _this.resource = resource;
        _this.attr = attr;
        _this.resourceIdentifier = "Ref";
        return new Proxy(_this, {
            get: function (t, p) {
                if ((p in t) || typeof p == "symbol") {
                    return t[p];
                }
                else if (isNaN(Number(p))) {
                    return new ReferenceField(resource, attr + "." + p);
                }
                else {
                    return new ReferenceField(resource, attr + "[" + p + "]");
                }
            }
        });
    }
    ReferenceField.create = function (resource, attr) {
        if (attr == "") {
            return new ReferenceField(resource, attr);
        }
        else if (!isNaN(Number(attr))) {
            return new ReferenceField(resource, "[" + attr + "]");
        }
        else {
            return new ReferenceField(resource, "." + attr);
        }
    };
    ReferenceField.prototype.generateString = function () {
        if (this.resource instanceof resource_1.Resource) {
            return "${" + this.resource[general_1.getRef]({}) + this.attr + "}";
        }
        else {
            return "${data." + this.resource[general_1.getRef]({}) + this.attr + "}";
        }
    };
    ReferenceField.prototype.prepareQueue = function (mod, par) {
        this.resource[general_1.prepareQueue](mod, par);
    };
    ReferenceField.prototype.checkValid = function () {
        return this.resource[general_1.checkValid]();
    };
    ReferenceField.prototype.getName = function (par) {
        return this.resource[general_1.getName](par);
    };
    return ReferenceField;
}(AdvField));
exports.ReferenceField = ReferenceField;
function fieldToId(f) {
    if (f instanceof AdvField) {
        var x = f[general_1.getName]({});
        console.log(x);
        return x;
    }
    else {
        return f;
    }
}
exports.fieldToId = fieldToId;
