import { InlineAdvField } from "../field";
import { resourceIdentifier, getRef, prepareQueue, checkValid, getName } from "../symbols";
import { Resource } from "../generatables/resource";
import { modulePreparable } from "../stackBackend";
import { pathItem } from "../general";

export class ReferenceField extends InlineAdvField<string>{
    readonly [resourceIdentifier]:string="ref"
    constructor(private resource:Resource){
        super(1)
    }
    toJSON(){
        return this.resource[getRef]() as any
    }
    [prepareQueue](mod: modulePreparable,par: pathItem,ref:boolean){
        this.resource[prepareQueue](mod,par,true);
    }
    [checkValid](){
        return this.resource[checkValid]();
    }
    [getName](){
        return this.resource[getName]()
    }
}