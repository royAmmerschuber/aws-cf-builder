import { Generatable, checkValid, prepareQueue, generationQueue, SMap, getName, getRef, callFieldReferences, generateObject } from "./general";
import { Module } from "./module";
import _ from "lodash";

export abstract class Resource extends Generatable{
    protected [generationQueue]:SMap<any>={}
    protected __alias:string;
    alias(alias:string){
        this.__alias=alias;
        return this;
    }
    protected injectDependencies(dep:SMap<any>){}
    protected abstract generateName():string;
    [prepareQueue](mod:Module,par:SMap<any>){
        const name=this[getName](par)
        if(this[generationQueue][name]===undefined){
            this[generationQueue][name]=par
            _.defaults(mod[generationQueue].resources,{[this.resourceIdentifier]:[]})
                [this.resourceIdentifier][name]=this;
            this.prepareQueue(mod,par);
            _(this)
                .filter((_v,k) => k.startsWith("_") || k.startsWith("$"))
                .forEach(v => callFieldReferences(v,v => v[prepareQueue](mod,par)))
        }else{
            console.log("yo")
        }
    }
    [checkValid](){
        if(this.checkCache){
            console.log(this.checkCache)
            return this.checkCache
        }

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
                .filter((_v,k) => k.startsWith("_") || k.startsWith("$"))
                .flatMap(v => callFieldReferences(v,v => v[checkValid]()))
                .value()
        )
        return this.checkCache=out
    }
    [getName](par:SMap<any>){
        this.injectDependencies(par)
        if(this.__alias){
            return this.__alias;
        }else{
            const x=this.generateName();
            // console.log(x)
            return x
        }
    }
    [generateObject](name:string){
        this.injectDependencies(this[generationQueue][name])
        return this.generateObject()
    }
    [getRef](par:SMap<any>){
        return this.resourceIdentifier+"."+this[getName](par);
    }

}
