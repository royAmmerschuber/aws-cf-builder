import { getShortStack } from "./util";
import { modulePreparable } from "./moduleBackend";
import _ from "lodash/fp"
import { checkCache, stacktrace, resourceIdentifier, checkValid, prepareQueue, generateObject, s_path } from "./symbols";
// @ts-ignore

export const config={
    errorBlacklist:[/^internal/,/node_modules[\/\\]ts-node/,/gulp-cloudformationbuilder/],
    errorPathLength:3
}
export type SMap<T>={[k:string]:T};

export interface ResourceError{
    type:string,
    errors:string[]
}
export type pathItem=string[]|TopLevelGeneratable
export abstract class Generatable{
    [stacktrace]:string;
    protected [checkCache]:SMap<ResourceError>

    abstract [resourceIdentifier]:string;

    constructor(errorDepth){
        this[stacktrace]=getShortStack(2+errorDepth);
    }

    abstract [checkValid]():SMap<ResourceError>
    abstract [prepareQueue](module:modulePreparable,path:pathItem,ref:boolean):void
    abstract [generateObject]():any;
}
export abstract class TopLevelGeneratable extends Generatable{
    [s_path]:pathItem
}
