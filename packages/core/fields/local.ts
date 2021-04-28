import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, stacktrace, checkCache, toJson } from "../symbols";
import { SMap, ResourceError } from "../general";
import { stackPreparable } from "../stackBackend";
import { pathItem } from "../path";
import { callOnCheckValid, callOnPrepareQueue } from "../util";
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
        if (this[s_local_val][toJson] instanceof Function) {
            return this[s_local_val][toJson](...args)
        }else if(this[s_local_val] instanceof Function){
            console.error(`local:${this[stacktrace]}\n didnt properly go throug its lifecycle. this is probably a bug`)
            //@ts-ignore
            return this[s_local_val]()
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
        return this[checkCache]=callOnCheckValid(this[s_local_val], out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this[s_local_val],stack, path, ref)
    }
}
export function Local<T>(val?: T | (() => T)) {
    return new localField(val)
}