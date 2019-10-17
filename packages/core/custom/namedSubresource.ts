import { InlineAdvField } from "../field";
import { generateExpression, resourceIdentifier, checkValid, prepareQueue, s_path, pathName } from "../symbols";
import { SMap, ResourceError, pathItem } from "../general";
import { modulePreparable } from "../moduleBackend";
import { Resource } from "../generatables/resource";

export class NamedSubresource extends InlineAdvField<void>{
    [resourceIdentifier]="NamedSubresource";
    constructor(
        private name:string,
        private resource:Resource
    ){
        super(1)
    }
    toJSON(){
        return undefined
    }
    [generateExpression](): string {
        //this is supposed to happen, maybe a better error needed
        throw new Error("Method not implemented.");
    }    
    [checkValid](): SMap<ResourceError> {
        return this.resource[checkValid]()
    }
    [prepareQueue](mod: modulePreparable, path: pathItem, ref: boolean): void {
        this[s_path]=path
        this.resource[prepareQueue](mod,this,ref)
    }
    [pathName](){
        return this.name
    }
}