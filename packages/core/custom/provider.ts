import { Provider, provSym } from "../generatables/provider";
import { SMap, ResourceError, Preparable, Generatable } from "../general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, s_path, checkCache } from "../symbols"
import { CustomParameters, CustomResource, customResource } from "./resource";
import _ from "lodash/fp";
import { modulePreparable } from "../moduleBackend";
import { isAdvField } from "../field";
import { prepareQueueBase, generateUniqueIdentifier } from "../util";
import { CustomBlock, customBlock } from "./block"
import { Parent } from "./parent";
import { Resource } from "../generatables/resource";
import { NamedSubresource } from "./namedSubresource";
export class customProvider extends Provider {
    readonly [resourceIdentifier];
    private _: SMap<any> = {}
    private proxy: CustomProvider;
    public resources = new Proxy(((_: any) => { }) as CustomPropFunction<CustomProvider> & SMap<new () => CustomResource>, {
        apply: (target, This, argArray): CustomProvider => {
            //@ts-ignore
            return CustomPropFunction.create("resources",this._,this.proxy)(...argArray)
        },
        get: (tar, p, rec) => {
            if (typeof p == "string") {
                const prov = this
                return function () {
                    return new customResource(prov, p) as any
                } as any
            }
            return tar[p as any];
        }
    })
    private handler: ProxyHandler<CustomProvider> = {
        getPrototypeOf: (target) => {
            return this.constructor.prototype
        },
        get: (target, p, c) => {
            if (typeof p == "symbol") {
                const v = this[p as any]
                if (v instanceof Function) {
                    return (...args) => (this[p as any] as Function).call(this, args);
                }
                return this[p as any]
            } else if (typeof p == "string") {
                if (p == "resources") {
                    return this.resources
                }
                return CustomPropFunction.create(p,this._,this.proxy)
            }
        }
    }
    constructor(name: string) {
        super(0)
        this[resourceIdentifier] = _.snakeCase(name)
        return this.proxy = new Proxy<CustomProvider>(this as any, this.handler)
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        return this[checkCache] = _.flow(
            _.filter(v => v instanceof Preparable),
            _.map((o) => o[checkValid]()),
            _.reduce(_.assign, {})
        )(this._)
    }
    [prepareQueue](mod: modulePreparable, path: any, ref: boolean): void {
        this[provSym.numberOfRefs]++
        if (prepareQueueBase(mod, path, ref, this)) {
            const rec = v => {
                if (v instanceof Preparable) {
                    v[prepareQueue](mod, subPath, false)
                } else if (typeof v == "object") {
                    _.forEach(rec, v)
                }
            }
            const subPath = this
            _.forEach(rec, this._)
        }
    }
    [generateObject]() {
        return _.flow(
            _.toPairs,
            _.filter(v => !(v[1] instanceof Generatable) || isAdvField(v[1])),
            _.map(v => {
                const k = v[0]; v = v[1]
                return [_.snakeCase(k), v]
            }),
            _.fromPairs,
            v => {
                if (!this[provSym.isDefault]) {
                    v.alias = generateUniqueIdentifier(this[s_path])
                }
                return v
            }
        )(this._)
    }
}

export namespace customProvider {
    export const B: new () => CustomBlock = customBlock as any
    export const P=Parent
}

export interface CustomPropFunction<This>{
    /**
     * @param val the value of the function
     */
    <val>(val: val):This
    <val extends Generatable>(id:string,SubResource:val):This
}
export namespace CustomPropFunction{
    export function create<This>(name:string,container:object,This:This):CustomPropFunction<This>{
        return <T,U extends Resource>(vi:T|string,resource?:U)=>{
            if(resource){
                if(typeof vi!="string"){
                    throw new Error("must be string")
                }
                container[name]=new NamedSubresource(vi,resource)
            }else{
                container[name]=vi
            }
            return This
        }
    }
}
export type CustomProvider = customProvider & CustomParameters