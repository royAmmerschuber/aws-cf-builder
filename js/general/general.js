"use strict";
exports.__esModule = true;
var lodash_1 = require("lodash");
var chalk_1 = require("chalk");
// @ts-ignore
var stack = require("callsite");
exports.config = {
    errorBlacklist: [/^internal/, /node_modules[\/\\]ts-node/, /gulp-cloudformationbuilder/],
    errorPathLength: 3
};
exports.generateObject = Symbol("generateObject");
exports.checkValid = Symbol("checkValid");
exports.prepareQueue = Symbol("prepareQueue");
exports.generationQueue = Symbol("generationQueue");
exports.getName = Symbol("getName");
exports.getRef = Symbol("getRef");
var Generatable = /** @class */ (function () {
    function Generatable(errorDepth) {
        this.stacktrace = getStack(2 + errorDepth);
    }
    Generatable.prototype[exports.checkValid] = function () {
        return this.checkCache || (this.checkCache = this.checkValid());
    };
    ;
    Generatable.prototype[exports.prepareQueue] = function (module, param) { return this.prepareQueue(module, param); };
    Generatable.prototype[exports.generateObject] = function (name) { return this.generateObject(); };
    ;
    return Generatable;
}());
exports.Generatable = Generatable;
function getStack(errorDepth) {
    return lodash_1["default"](stack())
        .filter(function (v) { return exports.config.errorBlacklist.every(function (c) { return v.getFileName() && v.getFileName().search(c) == -1; }); })
        .drop(1 + errorDepth)
        .map(function (v) {
        var pathMatch = v.getFileName().match(new RegExp("(?:[\\\\\\/][^\\\\\\/]*){1," + exports.config.errorPathLength + "}$"));
        return {
            func: v.getFunctionName() ? v.getFunctionName() : "Object.<anonymous>",
            file: pathMatch && "..." + pathMatch[0],
            line: v.getLineNumber(),
            col: v.getColumnNumber()
        };
    })
        .filter(function (v) { return v != null; })
        .map(function (v) { return chalk_1["default"].red(v.func) + chalk_1["default"].bold.redBright(" (" + v.file + ":" + v.line + ":" + v.col + ")") + ";"; })
        .reduce(function (o, c) { return c + o; }, "");
}
function callFieldReferences(field, func) {
    if (typeof field == "object") {
        if (field instanceof Generatable) {
            return [func(field)];
        }
        return lodash_1["default"].flatMap(field, function (v) { return callFieldReferences(v, func); });
    }
    return [];
}
exports.callFieldReferences = callFieldReferences;
