import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, s_path, pathName, toJson } from "../symbols";
import { SMap, ResourceError } from "../general";
import { stackPreparable } from "../stackBackend";
import { Resource } from "../generatables/resource";
import { pathItem } from "../path";

export class NamedSubresource extends InlineAdvField<void>{
    [resourceIdentifier]="NamedSubresource";
    constructor(
        private name:string,
        private resource:Resource
    ){
        super(1)
    }
    [toJson](){
        return undefined
    }
    [checkValid](): SMap<ResourceError> {
        return this.resource[checkValid]()
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        this[s_path]=path
        this.resource[prepareQueue](stack,this,false)
    }
    [pathName](){
        return this.name
    }
}