import { SMap, ResourceError, TopLevelGeneratable } from "./general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject } from "./symbols";
import { modulePreparable } from "./moduleBackend";
import { prepareQueueBase } from "./util";

export class output<T> extends TopLevelGeneratable{
    readonly [resourceIdentifier]= "output";
    constructor(){super(0)}
    [checkValid](): SMap<ResourceError> {
        //TEMP
        //TODO
        return {}
    }
    [prepareQueue](mod: modulePreparable, path: any, ref:boolean): void {
        if(prepareQueueBase(mod,path,ref,this)){
            //TODO
        }
    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
}
export type Output<T>=output<T>
export function Output<T>():Output<T>{
    return new output<T>()
}