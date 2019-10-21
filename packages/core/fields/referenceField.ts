import { InlineAdvField } from "../field";
import { resourceIdentifier, getRef, prepareQueue, checkValid, getName } from "../symbols";
import { Resource } from "../generatables/resource";
import { stackPreparable } from "../stackBackend";
import { pathItem } from "../general";

export class ReferenceField extends InlineAdvField<string>{
    readonly [resourceIdentifier]:string="ref"
    constructor(private resource:Resource){
        super(1)
    }
    toJSON(){
        return this.resource[getRef]()
    }
    [prepareQueue](stack: stackPreparable,par: pathItem,ref:boolean){
        this.resource[prepareQueue](stack,par,true);
    }
    [checkValid](){
        return this.resource[checkValid]();
    }
    [getName](){
        return this.resource[getName]()
    }
}