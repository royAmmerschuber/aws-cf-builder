import { InlineAdvField } from "../field";
import { resourceIdentifier, prepareQueue, checkValid, getName } from "../symbols";
import { Resource } from "../generatables/resource";
import { stackPreparable } from "../stackBackend";
import { pathItem } from "../path";

export class ReferenceField extends InlineAdvField<string>{
    readonly [resourceIdentifier]:string="ref"
    
    constructor(resource:Resource)
    constructor(psuedoParam:string)
    constructor(private resource:Resource|string){
        super(1)
    }
    toJSON(){
        if(typeof this.resource=="string"){
            return {
                Ref:this.resource
            }
        }
        return {
            Ref:this.resource[getName]()
        }
    }
    [prepareQueue](stack: stackPreparable,par: pathItem,ref:boolean){
        if(typeof this.resource!="string"){
            this.resource[prepareQueue](stack,par,true);
        }
    }
    [checkValid](){
        if(typeof this.resource=="string") return {}
        return this.resource[checkValid]();
    }
    [getName](){
        if(typeof this.resource=="string") return this.resource
        return this.resource[getName]()
    }
}