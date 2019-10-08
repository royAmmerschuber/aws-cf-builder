import { SMap, ResourceError, TopLevelGeneratable, pathItem } from "./general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject } from "./symbols";
import { modulePreparable } from "./moduleBackend";
import { prepareQueueBase } from "./util";

export class variable<T> extends TopLevelGeneratable{
    readonly [resourceIdentifier]:"variable"
    constructor(){super(0)}
    [checkValid](): SMap<ResourceError> {
        //TEMP
        //TODO
        return {}
    }
    [prepareQueue](mod: modulePreparable, path: pathItem,ref:boolean): void {
        if(prepareQueueBase(mod,path,ref,this)){
            //TODO
        }
    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
}
export type Variable<T>=variable<T>
export function Variable<T>():Variable<T>{
    return new variable<T>()
}