import { Resource } from "./resource";
import { getName, prepareQueue, SMap, getRef, ResourceError, checkValid, Generatable } from "./general";
import { Module } from "./module";
import { DataSource } from "./dataSource";

export type Field<T>=T|AdvField<T>
export type Ref<T,ref>=Field<T>|ref
export abstract class AdvField<T> extends Generatable{
    toJSON(){
        return this.generateObject()
    }
    [prepareQueue](mod:Module,par:SMap<any>){
        
        this.prepareQueue(mod,par)
    }
    [checkValid](){return this.checkValid()}
    [getName](par:SMap<any>){return this.getName(par)}
    protected abstract checkValid():SMap<ResourceError>
    protected abstract prepareQueue(mod:Module,par:SMap<any>)
    protected abstract generateObject():string
    protected abstract getName(par:SMap<any>):string
}

export class ReferenceField<T> extends AdvField<T>{
    protected readonly resourceIdentifier="Ref"
    constructor(private resource:Resource|DataSource,private attr:string){super(1)}
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
    protected getName(par){
        return this.resource[getName](par)
    }
}

export function fieldToId(f:Field<any>):string{
    if(f instanceof AdvField){
        const x=f[getName]({})
        console.log(x)
        return x
    }else{
        return f
    }
}