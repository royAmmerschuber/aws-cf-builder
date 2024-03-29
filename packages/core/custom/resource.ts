import { Resource } from "../generatables/resource";
import { SMap, Preparable, ResourceError, Generatable } from "../general";
import { stackPreparable } from "../stackBackend";
import _ from "lodash/fp";
import { isAdvField } from "../field";
import { resourceIdentifier, checkValid, generateObject, prepareQueue, checkCache, getName } from "../symbols";
import { prepareQueueBase, callOnCheckValid, callOnPrepareQueue, generateUniqueIdentifier } from "../util";
import { NamedSubresource } from "./namedSubresource";
import { CustomBlock, customBlock } from "./block";
import { Parent } from "./parent";
import { ReferenceField } from "../fields/referenceField";
import { AttributeField } from "../fields/attributeField"
import { pathItem } from "../path";
import { Parameter } from "../generatables/parameter";
const pascalCase=_.flow(
    _.camelCase,
    _.upperFirst
)

export const Custom:SMap<SMap<new ()=>CustomResource>>
    & {B:new ()=>CustomBlock,P:typeof Parent}
    & (new (obj:any)=>CustomBase) =new Proxy(class{
        static cache=new Map<string,any>()
        static subHandler={
            get(target,p,reciever){
                if(typeof p!="string"){
                    throw new Error("not supported")
                }
                return function(){
                    return new customResource(target.area,p)
                }
            },
        } as ProxyHandler<{area:string}>
    },{
        construct(target,args:[any],newTarget){
            return new CustomBase(...args)
        },
        get(target,p,reciever){
            if(typeof p!="string"){
                throw new Error("not supported")
            }
            if(p=="B"){
                return customBlock
            }else if(p=="P"){
                return Parent
            }
            const cResult=target.cache.get(p)
            if(cResult){
                return cResult
            }else{
                const subProx=new Proxy({
                    area:p
                },target.subHandler)
                target.cache.set(p,subProx)
                return subProx
            }
        }
    }) as any
export class customResource extends Resource{
    readonly [resourceIdentifier]:string
    private _:SMap<any>={};
    
    private handler:ProxyHandler<customResource>={
        get:(target,p,c)=>{
            if(typeof p=="symbol"){
                const v=this[p as any]
                if(v instanceof Function){
                    return (this[p as any] as Function).bind(this)
                }
                return this[p as any]
            }else if(typeof p=="string"){
                if(p=="r"){
                    return this.r
                }else if(p=="a"){
                    return this.a
                }
                return CustomPropFunction.create(p,this._,this.proxy)
            }
        }
    }
    private proxy:customResource

    r=new ReferenceField(this)
    a=AttributeField.createMap(this)
    constructor(area:string,name:string){
        super(3)
        this[resourceIdentifier]=`AWS::${area}::${name}`
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
    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(stack,path,ref,this)){
            const subPath=this
            const rec = v => {
                if (v instanceof Preparable) {
                    if(isAdvField(v) || v instanceof Parameter){
                        v[prepareQueue](stack,subPath,true)
                    }else{
                        v[prepareQueue](stack,subPath,false)
                    }
                } else if (typeof v == "object") {
                    _.forEach(rec, v)
                }
            }
            _.forEach(rec, this._)
        }
    }
    [generateObject](){
        return {
            Type:this[resourceIdentifier],
            Properties:_.flow(
                _.pickBy<any>((v)=>!(v instanceof Resource)),
                _.mapKeys(pascalCase)
            )(this._) as any
        }
    }
}
export class CustomBase extends Resource{
    readonly [resourceIdentifier]: string;
    r=new ReferenceField(this);
    a=AttributeField.createMap(this)
    constructor(private obj:any){
        super(3)
        this[resourceIdentifier]=obj.Type ?? "Custom"
    }

    [generateObject]() {
        return this.obj
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOnCheckValid(this.obj,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this.obj,stack,path,true)
        }
    }
    [getName](){
        return generateUniqueIdentifier(this)+"Custom"
    }

}

export interface CustomParameters{
    [k:string]:CustomPropFunction<this>
}
export type CustomResource=customResource & CustomParameters;

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
