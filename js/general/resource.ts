import { Generatable, checkValid, prepareQueue, generationQueue, SMap, getName, generateObject, getRef } from "./general";
import { Module } from "./module";
import _ from "lodash";
import { AdvField } from "./field";

export abstract class Resource extends Generatable{
    protected __alias:string;
    private isPrepared:boolean
    alias(alias:string){
        this.__alias=alias;
        return this;
    }
    protected injectDependencies(dep:SMap<any>){}
    protected abstract generateName(par:SMap<any>):string;
    [prepareQueue](mod:Module,par:SMap<any>){
        const name=this[getName](par)
        if(!this.isPrepared){
            _.defaults(mod[generationQueue].resources,{[this.resourceIdentifier]:[]})
                [this.resourceIdentifier][name]=this;
            this.prepareQueue(mod,par);
            _(this)
                .entries()
                .filter(v => v[0].startsWith("_") && v[1] instanceof AdvField)
                .forEach(v => v[1][prepareQueue](mod,par))
                
            this.isPrepared=true;
        }
    }
    [checkValid](){
        if(this.checkCache) return this.checkCache

        const out=this.checkValid();
        let errors:string[]=[];
        if(this.stacktrace in out){
            errors=out[this.stacktrace].errors
        }
        if(errors.length && !(this.stacktrace in out)){
            out[this.stacktrace]={
                errors:errors,
                type:this.resourceIdentifier
            }
        }
        _.assign(out,
            ..._(this)
                .entries()
                .filter(v => v[0].startsWith("_") && v[1] instanceof AdvField)
                .map(v =>(<AdvField<any>>v[1])[checkValid]())
                .value()
        )
        return this.checkCache=out
    }
    [getName](par:SMap<any>){
        if(this.__alias){
            return this.__alias;
        }else{
            return this.generateName(par);
        }
    }
    [getRef](par:SMap<any>){
        return this.resourceIdentifier+"."+this[getName](par);
    }
}