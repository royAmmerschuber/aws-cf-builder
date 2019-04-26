import { Resource } from "./resource";
import { getName, prepareQueue, SMap, getRef, ResourceError, checkValid } from "./general";
import { Module } from "./module";
import { DataSource } from "./dataSource";

export type Field<T>=T|AdvField<T>
export type Ref<T,ref>=Field<T>|ref
export abstract class AdvField<T>{
    toJSON(){
        return this.generateObject()
    }
    [prepareQueue](mod:Module,par:SMap<any>){
        
        this.prepareQueue(mod,par)
    }
    [checkValid](){return this.checkValid()}
    [getName](){return this.getName()}
    protected abstract checkValid():SMap<ResourceError>
    protected abstract prepareQueue(mod:Module,par:SMap<any>)
    protected abstract generateObject():string
    protected abstract getName():string
}

export class ReferenceField<T> extends AdvField<T>{
    constructor(private resource:Resource|DataSource,private attr:string){super()}
    protected generateObject(){
        if(this.resource instanceof Resource){
            return "${"+this.resource[getRef]({})+"."+this.attr+"}"
        }else{
            return "${data."+this.resource[getRef]({})+"."+this.attr+"}"
        }
    }
    protected prepareQueue(mod: Module,par: SMap<any>){
        this.resource[prepareQueue](mod,par);
    }
    protected checkValid(){
        return this.resource[checkValid]();
    }
    protected getName(){
        return this.resource[getName]({})
    }
}

export function fieldToId(f:Field<any>):string{
    if(f instanceof AdvField){
        return f[getName]()
    }else{
        return f
    }
}