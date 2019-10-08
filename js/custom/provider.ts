import { Provider, provSym, generateUniqueIdentifier } from "../general/provider";
import { SMap, ResourceError, Generatable } from "../general/general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, s_path } from "../general/symbols"
import { CustomResource, CustomParameters } from "./resource";
import _ from "lodash/fp";
import { modulePreparable } from "../general/moduleBackend";
import { AdvField } from "../general/field";
import { prepareQueueBase } from "../general/util";
export class customProvider extends Provider {
    readonly [resourceIdentifier];
    private propertyHolder: SMap<any> = {}
    private proxy: CustomProvider;
    paramFunction(name: string) {
        return <val>(val: val): CustomProvider => {
            this.propertyHolder[name] = val
            return this.proxy
        }
    }
    public resources = new Proxy(((_:any) => { }) as CustomPropFunction<CustomProvider> & SMap<() => CustomResource>, {
        apply: (target, This, argArray): CustomProvider => {
            //@ts-ignore
            return this.paramFunction("resources")(...argArray)
        },
        get: (tar, p, rec): (() => CustomResource) => {
            if (typeof p == "string") {
                return () => CustomResource(this, p)
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
                return this.paramFunction(p)
            }
        }
    }
    constructor(name: string) {
        super(0)
        this[resourceIdentifier] = _.snakeCase(name)
        return this.proxy = new Proxy<CustomProvider>(this as any, this.handler)
    }
    [checkValid](): SMap<ResourceError> {
        return {}
    }
    [prepareQueue](mod: modulePreparable, path: any, ref: boolean): void {
        this[provSym.numberOfRefs]++
        if(prepareQueueBase(mod,path,ref,this)){
            const rec=v => {
                if(v instanceof Generatable){
                    v[prepareQueue](mod,subPath,false)
                }else if(typeof v=="object"){
                    _.forEach(rec,v)
                }
            }
            const subPath=this
            _.forEach(rec,this.propertyHolder)
        }
    }
    [generateObject](){
        return _.flow(
            _.toPairs,
            _.filter(v => !(v[1] instanceof Generatable) || v[1] instanceof AdvField),
            _.map(v => {
                const k=v[0];v=v[1]
                return [_.snakeCase(k),v]
            }),
            _.fromPairs,
            v => {
                if(!this[provSym.isDefault]){
                    v.alias=generateUniqueIdentifier(this[s_path])
                }
                return v
            }
        )(this.propertyHolder)
    }
}


export type CustomPropFunction<This> = <val>(val: val) => This
interface CustomProviderProperties extends CustomParameters {
    resources: SMap<() => CustomResource> & CustomPropFunction<this>
}
export type CustomProvider = customProvider & CustomProviderProperties
