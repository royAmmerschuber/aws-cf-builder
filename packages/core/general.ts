import { getShortStack } from "./utilLow";
import { stackPreparable } from "./stackBackend";
import _ from "lodash/fp"
import { checkCache, stacktrace, resourceIdentifier, checkValid, prepareQueue, generateObject, s_path, pathName } from "./symbols";
import chalk from "chalk";
import { pathable, pathItem } from "./path";
// @ts-ignore


export interface SMap<T>{
    [k:string]:T
}

export interface ResourceError{
    type:string,
    errors:string[]
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
    abstract [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean):void
}
export abstract class Generatable extends Preparable{
    abstract [generateObject]():any;
}
export class PreparableError extends Error{
    constructor(prep:Preparable,...errors:string[]){
        super()
        this.stack=[
            prep[stacktrace],
            chalk.yellow(prep[resourceIdentifier]),
            ...errors
        ].join("\n")
    }
}