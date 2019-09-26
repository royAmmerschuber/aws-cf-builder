import { Resource } from "../general/resource";
import { CustomPropFunction } from "./provider";
import { SMap, ResourceError, Generatable } from "../general/general";
import { modulePreparable } from "../general/module";
import _f from "lodash/fp";
import _ from "lodash"
import { Field, ReferenceField } from "../general/field";
import { Provider } from "../general/provider";
import { provider, resourceIdentifier, checkValid, generateObject, prepareQueue } from "../general/symbols";
class customResource extends Resource{
    readonly [resourceIdentifier]:string
    private propertyHolder:SMap<any>={};
    
    private handler:ProxyHandler<CustomResource>={
        getPrototypeOf:(target)=>{
            return this.constructor.prototype
        },
        get:(target,p,c)=>{
            if(typeof p=="symbol"){
                const v=this[p as any]
                if(v instanceof Function){
                    return (...args)=>(this[p as any] as Function).call(this,...args);
                }
                return this[p as any]
            }else if(typeof p=="string"){
                if(p=="d"){
                    return this.d
                }
                return this.paramFunction(p)
            }
        }
    }
    private proxy:CustomResource

    d=ReferenceField.create<SMap<any>>(this,"")
    constructor(prov:Provider,name:string){
        super(0)
        this[provider]=prov
        this[resourceIdentifier]=prov[resourceIdentifier]+"_"+_f.snakeCase(name)
        return this.proxy=new Proxy(this as any,this.handler)
    }

    private paramFunction(name:string){
        return <val>(val:val):CustomResource=>{
            this.propertyHolder[name]=val
            return this.proxy
        }
    }
    [checkValid](){
        return {}
    }
    [generateObject](){
        return _f.flow(
            _f.pickBy<any>((v)=>!(v instanceof Resource)),
            _f.mapKeys((v:string)=>_f.snakeCase(v))
        )(this.propertyHolder)
    }
    [prepareQueue](mod:modulePreparable,param:any){
        if(!mod.resources.has(this)){
            mod.resources.add(this)
            const subParam=_.clone(param)
            subParam[this[resourceIdentifier]]=this
            _.forEach(this.propertyHolder,(v) => {
                if(v instanceof Generatable){
                    v[prepareQueue](mod,param)
                }
            })
        }
    }
}

export function CustomResource(provider:Provider,name:string):CustomResource{
    return new customResource(provider,name) as any
}
export interface CustomParameters{
    [k:string]:CustomPropFunction<this>
}
export type CustomResource=customResource & CustomParameters