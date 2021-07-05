import { InlineAdvField } from "../field";
import { resourceIdentifier, prepareQueue, checkValid, getName, toJson } from "../symbols";
import { Resource } from "../generatables/resource";
import { stackPreparable } from "../stackBackend";
import { pathItem } from "../path";

export class ReferenceField extends InlineAdvField<string>{
    readonly [resourceIdentifier]:string="ref"
    
    constructor(resource:Resource,skipDep?:boolean)
    constructor(psuedoParam:string,skipDep?:boolean)
    constructor(private resource:Resource|string,private skipDep=false){
        super(1)
    }
    [toJson](){
        return {
            Ref:(typeof this.resource =="string") 
                ? this.resource 
                : this.resource[getName]()
        }
    }
    [prepareQueue](stack: stackPreparable,par: pathItem,ref:boolean){
        if(this.skipDep)return;
        if(typeof this.resource!="string"){
            this.resource[prepareQueue](stack,par,true);
        }
    }
    [checkValid](){
        if(this.skipDep)return {};
        if(typeof this.resource=="string") return {}
        return this.resource[checkValid]();
    }
    [getName](){
        if(typeof this.resource=="string") return this.resource
        return this.resource[getName]()
    }
}