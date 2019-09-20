import { Resource } from "../general/resource";
import { CustomPropFunction } from "./provider";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, SMap, ResourceError } from "../general/general";
import { Module } from "../general/module";
import _ from "lodash";
import { Field } from "../general/field";
class customResource extends Resource{
    protected [resourceIdentifier]: string;
    private propertyHolder:SMap<any>={};
    
    private handler:ProxyHandler<CustomResource>={
        getPrototypeOf:(target)=>{
            return this.constructor.prototype
        },
        get:(target,p,c)=>{
            if(typeof p=="symbol"){
                const v=this[p as any]
                if(v instanceof Function){
                    return (...args)=>(this[p as any] as Function).call(this,args);
                }
                return this[p as any]
            }else if(typeof p=="string"){
                return this.paramFunction(p)
            }
        }
    }
    private proxy:CustomResource

    public d:SMap<Field<string>>
    constructor(provider:string,name:string){
        super(0)
        this[resourceIdentifier]=_.snakeCase(name)
        return this.proxy=new Proxy(this as any,this.handler)
    }

    private paramFunction(name:string){
        return <val>(val:val):CustomResource=>{
            this.propertyHolder[name]=val
            return this.proxy
        }
    }

    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](module: Module, param: any): void {
        throw new Error("Method not implemented.");
    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
}

export function CustomResource(provider:string,name:string):CustomResource{
    return new customResource(provider,name) as any
}
export interface CustomParameters{
    [k:string]:CustomPropFunction<this>
}
export type CustomResource=customResource & CustomParameters