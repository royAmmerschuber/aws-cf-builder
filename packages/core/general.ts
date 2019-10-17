import { getShortStack } from "./utilLow";
import { modulePreparable } from "./moduleBackend";
import _ from "lodash/fp"
import { checkCache, stacktrace, resourceIdentifier, checkValid, prepareQueue, generateObject, s_path } from "./symbols";
// @ts-ignore


export interface SMap<T>{
    [k:string]:T
}

export interface ResourceError{
    type:string,
    errors:string[]
}
export type pathItem=string[]|pathable
export interface pathable{
    [s_path]:pathItem
}
export abstract class Preparable implements pathable{
    [stacktrace]:string;
    [s_path]:pathItem
    protected [checkCache]:SMap<ResourceError>

    abstract [resourceIdentifier]:string;

    constructor(errorDepth){
        this[stacktrace]=getShortStack(2+errorDepth);
    }

    abstract [checkValid]():SMap<ResourceError>
    abstract [prepareQueue](module:modulePreparable,path:pathItem,ref:boolean):void
}
export abstract class Generatable extends Preparable{
    abstract [generateObject]():any;
}