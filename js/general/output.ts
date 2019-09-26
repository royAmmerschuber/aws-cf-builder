import { Generatable, SMap, ResourceError } from "./general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject } from "./symbols";
import { Module, modulePreparable } from "./module";

export class Output<T> extends Generatable{
    [resourceIdentifier]: string;
    thisisaoutput:T
    constructor(){super(0)}
    [checkValid](): SMap<ResourceError> {
        //TEMP
        //TODO
        return {}
    }
    [prepareQueue](module: modulePreparable, param: any): void {
        if(module.output.has(this)){
            module.output.add(this)
        }
    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
}