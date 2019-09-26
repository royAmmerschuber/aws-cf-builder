import { Resource } from "./resource";
import {  SMap, Generatable } from "./general";
import { Module, modulePreparable } from "./module";
import { DataSource } from "./dataSource";
import { resourceIdentifier, prepareQueue, checkValid, getName, getRef, generateObject } from "./symbols";
import { Output } from "./output";

export type Field<T>=T|AdvField<T>
export type Ref<T,ref>=Field<T>|ref
export abstract class AdvField<T> extends Generatable{
    abstract toJSON():T|string
    abstract [getName](par:SMap<any>):string
    [generateObject](){return {}}
}
type referenceMerger<T>=ReferenceField<T> & (
    T extends object ?
    {[k in keyof T]:referenceMerger<T[k]>} :
    {}
)
export class ReferenceField<T> extends AdvField<T>{
    protected readonly [resourceIdentifier]="Ref"
    public static create<T>(resource:Resource|DataSource,attr:string):referenceMerger<T>{
        if(attr==""){
            return new ReferenceField(resource,attr) as any
        }else if(!isNaN(Number(attr))){
            return new ReferenceField(resource,"["+attr+"]") as any
        }else{
            return new ReferenceField(resource,"."+attr) as any
        }
    }
    protected constructor(private resource:Resource|DataSource,private attr:string){
        super(1)
        return new Proxy(this,{
            get(t,p){
                if(typeof p=="symbol"){
                    const v=t[p as any]
                    if(v instanceof Function){
                        return (...args)=>(t[p as any] as Function).call(t,...args);
                    }
                    return t[p as any]
            }else if(isNaN(Number(p))){
                    return new ReferenceField(resource,attr+"."+p)
                }else{
                    return new ReferenceField(resource,attr+"["+p+"]")
                }
            }
        })
    }

    toJSON(){
        if(this.resource instanceof Resource){
            return "${"+this.resource[getRef]({})+this.attr+"}"
        }else{
            return "${data."+this.resource[getRef]({})+this.attr+"}"
        }
    }
    [prepareQueue](mod: modulePreparable,par: SMap<any>){
        this.resource[prepareQueue](mod,par);
    }
    [checkValid](){
        return this.resource[checkValid]();
    }
    [getName](par){
        return this.resource[getName](par)
    }
}

export class ModuleReferenceField<T> extends AdvField<T>{
    public static create<T>(mod:Module<any>,output:Output<T>):ModuleReferenceField<T>{
        throw "not implemented"
    }
}
export function fieldToId(f:Field<any>):string{
    if(f instanceof AdvField){
        const x=f[getName]({})
        return x
    }else{
        return f
    }
}
