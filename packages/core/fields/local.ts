import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, stacktrace, checkCache, toJson } from "../symbols";
import { SMap, ResourceError, Preparable } from "../general";
import { stackPreparable } from "../stackBackend";
import { pathItem } from "../path";
import { callOn } from "../util";
import _ from "lodash/fp"

export const s_local_val = Symbol("local_val")
export class localField<T> extends InlineAdvField<T>{
    [resourceIdentifier]: "localField";
    [s_local_val]: T | (() => T)
    constructor(val?: T | (() => T)) {
        super(1)
        this[s_local_val] = val
    }
    value(val: T) {
        this[s_local_val] = val
        return this
    }
    [toJson](...args) {
        //@ts-ignore
        if (this[s_local_val][toJson] instanceof Function) {
            //@ts-ignore
            return this[s_local_val][toJson](...args)
        }
        return this[s_local_val]
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (this[s_local_val] === undefined) {
            errors.push("no value specified")
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                errors,
                type: this[resourceIdentifier]
            }
        }
        if (this[s_local_val] instanceof Function) {
            this[s_local_val] = (this[s_local_val] as () => T)()
        }
        return this[checkCache]=callOn(this[s_local_val], Preparable, o => o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOn(this[s_local_val], Preparable, o => o[prepareQueue](stack, path, ref))
    }
}
export function Local<T>(val?: T | (() => T)) {
    return new localField(val)
}