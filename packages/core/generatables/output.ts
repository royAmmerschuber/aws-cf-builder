import { SMap, ResourceError, Generatable, Preparable } from "../general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, getName, s_path, stacktrace, checkCache } from "../symbols";
import { modulePreparable } from "../moduleBackend";
import { prepareQueueBase, generateUniqueIdentifier } from "../util";
import { Field } from "../field";
import _ from "lodash/fp";

export class Output<T> extends Generatable{
    readonly [resourceIdentifier]= "output";
    private _:{
        name:string,
        description:string,
        sensitive:boolean,
        value:Field<T>
    }={} as any
    constructor(name?:string){
        super(1)
        this._.name=name
    }
    description(text:string){
        this._.description=text
        return this
    }
    sensitive(bool:boolean=true){
        this._.sensitive=bool
        return this
    }
    value<U>(val:Field<U>): Output<U>{
        this._.value=val as any
        return this as any
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
        if(this._.value instanceof Preparable){
            out=_.assign(out,
                this._.value[checkValid]()
            )
        }
        return this[checkCache] = out
    }
    [prepareQueue](mod: modulePreparable, path: any, ref:boolean): void {
        if(prepareQueueBase(mod,path,ref,this)){
            if(this._.value instanceof Preparable){
                this._.value
            }
        }
    }
    [generateObject]() {
        return {
            description:this._.description,
            sensitive:this._.sensitive,
            value:this._.value
        }
    }
    [getName](){
        return this._.name || generateUniqueIdentifier(this[s_path])
    }
}