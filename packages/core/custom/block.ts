import { InlineAdvField, isAdvField } from "../field";
import { resourceIdentifier, checkValid, generateExpression, prepareQueue, checkCache } from "../symbols";
import { SMap, ResourceError, pathItem, Preparable } from "../general";
import { modulePreparable } from "../moduleBackend";
import { CustomParameters } from "./resource";
import _ from "lodash/fp"
import { CustomPropFunction } from "./provider";

export class customBlock extends InlineAdvField<object>{
    [resourceIdentifier]: string;
    private _: SMap<any> = {}
    handler:ProxyHandler<this>={
        get:(target,p,c)=>{
            if(typeof p=="symbol"){
                const v=this[p as any]
                if(v instanceof Function){
                    return (...args)=>(this[p as any] as Function).call(this,...args);
                }
                return this[p as any]
            }else if(typeof p=="string"){
                if(p=="toJSON"){
                    return ()=>this.toJSON()
                }
                return CustomPropFunction.create(p,this._,this.proxy)
            }
        }
    }
    proxy:CustomBlock
    constructor() { 
        super(1)
        this.proxy=new Proxy(this,this.handler) as any
        return this.proxy
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
        const subPath=path
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
    }

    toJSON() {
        return this._
    }
    [generateExpression](): string {
        return JSON.stringify(this._)
    }
}
export type CustomBlock = customBlock & CustomParameters;