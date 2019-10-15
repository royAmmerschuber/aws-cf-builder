import { Resource } from "../general/generatables/resource";
import { CustomPropFunction } from "./provider";
import { SMap, pathItem, Preparable, ResourceError } from "../general/general";
import { modulePreparable } from "../general/moduleBackend";
import _ from "lodash/fp";
import { ReferenceField, isAdvField } from "../general/field";
import { Provider } from "../general/generatables/provider";
import { provider, resourceIdentifier, checkValid, generateObject, prepareQueue, checkCache } from "../general/symbols";
import { prepareQueueBase } from "../general/util";
export class customResource extends Resource{
    readonly [resourceIdentifier]:string
    private _:SMap<any>={};
    
    private handler:ProxyHandler<customResource>={
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
                return CustomPropFunction.create(p,this._,this.proxy)
            }
        }
    }
    private proxy:customResource

    d=ReferenceField.create<any>(this,"")
    constructor(prov:Provider,name:string){
        super(3)
        this[provider]=prov
        this[resourceIdentifier]=prov[resourceIdentifier]+"_"+_.snakeCase(name)
        return this.proxy=new Proxy(this as any,this.handler)
    }

    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        return this[checkCache] = _.flow(
            _.filter(v => v instanceof Preparable),
            _.map((o) => o[checkValid]()),
            _.reduce(_.assign, {})
        )(this._)
    }
    [prepareQueue](mod:modulePreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(mod,path,ref,this)){
            const subPath=this
            const rec = v => {
                if (v instanceof Preparable) {
                    if(isAdvField(v)){
                        v[prepareQueue](mod,subPath,true)
                    }else{
                        v[prepareQueue](mod,subPath,false)
                    }
                } else if (typeof v == "object") {
                    _.forEach(rec, v)
                }
            }
            _.forEach(rec, this._)
            this[provider][prepareQueue](mod,subPath,true)
        }
    }
    [generateObject](){
        return _.flow(
            _.pickBy<any>((v)=>!(v instanceof Resource)),
            _.mapKeys((v:string)=>_.snakeCase(v))
        )(this._)
    }
}

export interface CustomParameters{
    [k:string]:CustomPropFunction<this>
}
export type CustomResource=customResource & CustomParameters;