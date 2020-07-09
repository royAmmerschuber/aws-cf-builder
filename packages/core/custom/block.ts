import { InlineAdvField, isAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache } from "../symbols";
import { SMap, ResourceError, Preparable } from "../general";
import { stackPreparable } from "../stackBackend";
import { CustomParameters, CustomPropFunction } from "./resource";
import _ from "lodash/fp"
import { pathItem } from "../path";
import { callOnCheckValid } from "../util";
import { Parameter } from "../generatables/parameter";

export class customBlock extends InlineAdvField<object>{
    [resourceIdentifier]: string;
    private _: SMap<any> = {}
    private handler: ProxyHandler<this> = {
        get: (target, p, c) => {
            if (typeof p == "symbol") {
                const v = this[p as any]
                if (v instanceof Function) {
                    return v.bind(this);
                }
                return v
            } else if (typeof p == "string") {
                if (p == "toJSON") {
                    return this.toJSON.bind(this)
                }
                return CustomPropFunction.create(p, this._, this.proxy)
            }
        }
    }
    private proxy: CustomBlock
    constructor() {
        super(1)
        this.proxy = new Proxy(this, this.handler) as any
        return this.proxy
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        return this[checkCache] = callOnCheckValid(this._,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean) {
        const subPath = path
        const rec = v => {
            if (v instanceof Preparable) {
                if (isAdvField(v) || v instanceof Parameter) {
                    v[prepareQueue](stack, subPath, true)
                } else {
                    v[prepareQueue](stack, subPath, false)
                }
            } else if (typeof v == "object") {
                _.forEach(rec, v)
            }
        }
        _.forEach(rec, this._)
    }

    toJSON() {
        return this._
    }
}
export type CustomBlock = customBlock & CustomParameters;