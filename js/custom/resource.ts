import { Resource } from "../general/resource";
import { CustomPropFunction } from "./provider";
import { SMap, Generatable, pathItem, TopLevelGeneratable } from "../general/general";
import { modulePreparable } from "../general/moduleBackend";
import _ from "lodash/fp";
import { ReferenceField } from "../general/field";
import { Provider } from "../general/provider";
import { provider, resourceIdentifier, checkValid, generateObject, prepareQueue } from "../general/symbols";
import { prepareQueueBase } from "../general/util";
class customResource extends Resource{
    readonly [resourceIdentifier]:string
    private propertyHolder:SMap<any>={};
    
    private handler:ProxyHandler<CustomResource>={
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
        this[resourceIdentifier]=prov[resourceIdentifier]+"_"+_.snakeCase(name)
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
        return _.flow(
            _.pickBy<any>((v)=>!(v instanceof Resource)),
            _.mapKeys((v:string)=>_.snakeCase(v))
        )(this.propertyHolder)
    }
    [prepareQueue](mod:modulePreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(mod,path,ref,this)){
            const subPath=this
            _.forEach(v => {
                if(v instanceof Generatable){
                    if (v instanceof TopLevelGeneratable){
                        v[prepareQueue](mod,subPath,false)
                        return
                    }
                    v[prepareQueue](mod,subPath,false)
                }
            },this.propertyHolder)
            this[provider][prepareQueue](mod,subPath,true)
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