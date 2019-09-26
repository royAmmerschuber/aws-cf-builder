import { Module, modulePreparable } from "./module";
import _ from "lodash";
import chalk from "chalk";
import { checkCache, stacktrace, resourceIdentifier, checkValid, prepareQueue, generateObject } from "./symbols";
// @ts-ignore
const stack= require("callsite") as ()=>NodeJS.CallSite[]

export const config={
    errorBlacklist:[/^internal/,/node_modules[\/\\]ts-node/,/gulp-cloudformationbuilder/],
    errorPathLength:3
}
export type SMap<T>={[k:string]:T};

export interface ResourceError{
    type:string,
    errors:string[]
}

export abstract class Generatable{
    protected [stacktrace]:string;
    protected [checkCache]:SMap<ResourceError>

    abstract [resourceIdentifier]:string;

    constructor(errorDepth){
        this[stacktrace]=getShortStack(2+errorDepth);
    }

    abstract [checkValid]():SMap<ResourceError>
    abstract [prepareQueue](module:modulePreparable,param:any):void
    abstract [generateObject]():any;
}
export function getShortStack(errorDepth:number){
    return _(stack())
        .filter(v=>config.errorBlacklist.every(c => v.getFileName() && v.getFileName().search(c)==-1))
        .drop(1+errorDepth)
        .map(v => {
            const pathMatch=v.getFileName().match(new RegExp("(?:[\\\\\\/][^\\\\\\/]*){1,"+config.errorPathLength+"}$"))
            return {
                func:v.getFunctionName() ? v.getFunctionName() : "Object.<anonymous>",
                file:pathMatch && "..."+pathMatch[0],
                line:v.getLineNumber(),
                col:v.getColumnNumber()
            }
        })
        .filter(v => v!=null)
        .map(v => chalk.red(v.func)+chalk.bold.redBright(" ("+v.file+":"+v.line+":"+v.col+")")+";")
        .reduce((o,c) => c+o,"");
}
export function callFieldReferences<T>(field:any,func:(a:Generatable)=>T):T[]{
    if(typeof field == "object"){
        if(field instanceof Generatable){
            return [func(field)]
        }
        return _.flatMap(field,v => callFieldReferences(v,func))
    }
    return [];
}