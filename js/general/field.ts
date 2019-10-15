import { Resource } from "./generatables/resource";
import { pathItem, Preparable, SMap, ResourceError, Generatable } from "./general";
import { Module } from "./generatables/module";
import { DataSource } from "./generatables/datasource";
import { resourceIdentifier, prepareQueue, checkValid, getName, getRef, generateExpression } from "./symbols";
import { Output } from "./generatables/output";
import { modulePreparable } from "./moduleBackend";

export type Field<T>=T|AdvField<T>
export type Ref<T,ref>=Field<T>|ref
export interface AdvField<T> extends Preparable{
    toJSON():T|string
    [generateExpression]():string
}
export function isAdvField(prep:any):prep is AdvField<any>{
    return (
        prep instanceof GeneratableAdvField ||
        prep instanceof InlineAdvField
    )
}
export abstract class GeneratableAdvField<T> extends Generatable implements AdvField<T>{
    abstract [generateExpression](): string
    toJSON(): string | T{
        return `\${${this[generateExpression]()}}`
    }
}
export abstract class InlineAdvField<T> extends Preparable implements AdvField<T>{
    abstract [generateExpression](): string
    toJSON(): string | T{
        return `\${${this[generateExpression]()}}`
    }
}
export type Reference<T>=ReferenceField<T> & referenceMerger<T>
export interface RFI{
    [k:string]:Reference<any>
}
let x:Reference<any>
type referenceMerger<T>=(
    checkAny<T> extends true
        ? RFI
        : T extends object
            ? {[k in keyof T]:Reference<T[k]>}
            : {}
)
type isObject<T>=T extends object
    ? true
    : false
type checkAny<T>=true extends isObject<T>
    ? false extends isObject<T>
        ? true
        : false
    : false
export class ReferenceField<T> extends InlineAdvField<T>{
    readonly [resourceIdentifier]="ref"
    public static create<T>(resource:Resource|DataSource,attr:string):Reference<T>{
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
                if(p=="toJSON"){
                   return () => t.toJSON()
                }else if(typeof p=="symbol"){
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
    [generateExpression](){
        return this.resource[getRef]()+this.attr
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
//TODO
//@ts-ignore
export class ModuleReferenceField<T> extends InlineAdvField<T>{
    toJSON(): string | T {
        throw new Error("Method not implemented.");
    }
    [resourceIdentifier]: string;
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](module: modulePreparable, path: pathItem, ref: boolean): void {
        throw new Error("Method not implemented.");
    }
    public static create<T>(mod:Module<any>,output:Output<T>):ModuleReferenceField<T>{
        throw "not implemented"
    }
}