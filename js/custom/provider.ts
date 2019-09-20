import { Provider } from "../general/provider";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, SMap, ResourceError } from "../general/general";
import { Module } from "../general/module";
import { CustomResource, CustomParameters } from "./resource";
import _ from "lodash";
export class customProvider extends Provider{
    protected readonly [resourceIdentifier];
    private propertyHolder:SMap<any>={}
    private proxy:CustomProvider;
    paramFunction(name:string){
        return <val>(val:val):CustomProvider=>{
            this.propertyHolder[name]=val
            return this.proxy
        }
    }
    public resources=new Proxy(((val:any)=>{}) as CustomPropFunction<CustomProvider> & SMap<()=>CustomResource>,{
        apply:(target,This,argArray):CustomProvider=>{
            //@ts-ignore
            return this.paramFunction("resources")(...argArray)
        },
        get:(tar,p,rec):(()=>CustomResource)=>{
            if(typeof p=="string"){
                return ()=>CustomResource(this[resourceIdentifier],p)
            }
            return tar[p as any];
        }
    })
    private handler:ProxyHandler<CustomProvider>={
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
                if(p=="resources"){
                    return this.resources
                }
                return this.paramFunction(p)
            }
        }
    }
    constructor(name:string){
        super(0)
        this[resourceIdentifier]=_.snakeCase(name)
        return this.proxy=new Proxy<CustomProvider>(this as any,this.handler)
    }
    [checkValid](): SMap<ResourceError> {
        return {}
    }
    [prepareQueue](module: Module, param: any): void {
    }
    [generateObject]() {
        return this.propertyHolder
    }
}


export type CustomPropFunction<This>=<val>(val:val)=>This
interface CustomProviderProperties extends CustomParameters{
    resources:SMap<()=>CustomResource> & CustomPropFunction<this>
}
export type CustomProvider=customProvider & CustomProviderProperties
