import { Generatable, SMap, ResourceError } from "./general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject } from "./symbols";
import { Module, modulePreparable } from "./module";

export class Variable<T> extends Generatable{
    thisisainput:T
    [resourceIdentifier]: string;
    constructor(){super(0)}
    [checkValid](): SMap<ResourceError> {
        //TEMP
        //TODO
        return {}
    }
    [prepareQueue](module: modulePreparable, param: any): void {
        if(module.variables.has(this)){
            module.variables.add(this)
        }
    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
}