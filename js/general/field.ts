import { Resource } from "./resource";
import { SMap, Generatable, pathItem } from "./general";
import { Module } from "./module";
import { DataSource } from "./dataSource";
import { resourceIdentifier, prepareQueue, checkValid, getName, getRef, generateObject } from "./symbols";
import { output } from "./output";
import { modulePreparable } from "./moduleBackend";

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
    readonly [resourceIdentifier]="ref"
    public static create<T>(resource:Resource|DataSource,attr:string):referenceMerger<T>{
        if(attr==""){
            return new ReferenceField(resource,attr) as any
        }else if(!isNaN(Number(attr))){
            return new ReferenceField(resource,`[${attr}]`) as any
        }else{
            return new ReferenceField(resource,`.${attr}`) as any
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
                    return new ReferenceField(resource,`${attr}.${p}`)
                }else{
                    return new ReferenceField(resource,`${attr}[${p}]`)
                }
            }
        })
    }

    toJSON(){
        return `\${${this.resource[getRef]()+this.attr}}`
    }
    [prepareQueue](mod: modulePreparable,par: pathItem,ref:boolean){
        this.resource[prepareQueue](mod,par,true);
    }
    [checkValid](){
        return this.resource[checkValid]();
    }
    [getName](par){
        return this.resource[getName](par)
    }
}

export class ModuleReferenceField<T> extends AdvField<T>{
    public static create<T>(mod:Module<any>,output:output<T>):ModuleReferenceField<T>{
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
