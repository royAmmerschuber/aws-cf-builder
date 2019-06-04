import { Module } from "./module";
import _ from "lodash";
import chalk from "chalk";
// @ts-ignore
const stack= require("callsite") as ()=>NodeJS.CallSite[]

export const config={
    errorBlacklist:[/^internal/,/node_modules[\/\\]ts-node/,/gulp-cloudformationbuilder/],
    errorPathLength:3
}

export const generateObject=Symbol("generateObject")
export const checkValid=Symbol("checkValid")
export const prepareQueue=Symbol("prepareQueue")
export const generationQueue=Symbol("generationQueue")
export const getName=Symbol("getName")
export const getRef=Symbol("getRef")
export type SMap<T>={[k:string]:T};

export interface ResourceError{
    type:string,
    errors:string[]
}

export abstract class Generatable{
    protected checkCache:SMap<ResourceError>

    protected stacktrace:string;
    protected abstract resourceIdentifier:string;

    constructor(errorDepth){
        this.stacktrace=getStack(2+errorDepth);
    }


    protected abstract checkValid():SMap<ResourceError>; 
    [checkValid](){
        return this.checkCache || (this.checkCache=this.checkValid())
    };

    protected abstract prepareQueue(module:Module,param:any);
    [prepareQueue](module:Module,param:any){return this.prepareQueue(module,param)}

    protected abstract generateObject():any;
    [generateObject](name:string){return this.generateObject()};
}
export function getStack(errorDepth:number){
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