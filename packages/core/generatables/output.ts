import { SMap, ResourceError, Generatable, Preparable } from "../general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, getName, s_path, stacktrace, checkCache } from "../symbols";
import { stackPreparable } from "../stackBackend";
import { prepareQueueBase, generateUniqueIdentifier } from "../util";
import { Field } from "../field";
import _ from "lodash/fp";

export class Output<T> extends Generatable{
    readonly [resourceIdentifier]= "output";
    private _:{
        name:string,
        description:string,
        value:Field<T>,
        exportName:Field<string>
    }={} as any
    constructor(name?:string){
        super(1)
        this._.name=name
    }
    description(text:string){
        this._.description=text
        return this
    }
    Value<U>(val:Field<U>): Output<U>{
        this._.value=val as any
        return this as any
    }
    export(name:Field<string>){
        this._.exportName=name
        return this
    }
    name(name:string){
        this._.name=name
        return this
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]){
            return this[checkCache]
        }
        let out:SMap<ResourceError>={}
        const errors:string[]=[];
        if(!this._.value){
            errors.push("you must specify a value")
        }
        
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        out=[
            this._.value,
            this._.name
        ].reduce((o,c)=>{
            if(c instanceof Preparable){
               return _.assign(o,c[checkValid]()) 
            }
            return o
        },out)
        return this[checkCache] = out
    }
    [prepareQueue](stack: stackPreparable, path: any, ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            [
                this._.value,
                this._.exportName
            ].forEach(v =>{
                if(v instanceof Preparable){
                    v[prepareQueue](stack,this,true)
                }
            })
        }
    }
    [generateObject]() {
        return {
            Description:this._.description,
            Value:this._.value,
            Export:this._.exportName && {
                Name:this._.exportName
            }
        }
    }
    [getName](){
        return this._.name || generateUniqueIdentifier(this[s_path])
    }
}