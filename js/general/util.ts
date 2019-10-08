import { config, Generatable, pathItem, TopLevelGeneratable } from "./general"
import _ from "lodash/fp"
import chalk from "chalk"
import { s_path, stacktrace } from "./symbols"
import { modulePreparable } from "./moduleBackend"
import { refPlaceholder } from "./refPlaceholder"
const stack= require("callsite") as ()=>NodeJS.CallSite[]
export function getShortStack(errorDepth:number){
    return _.flow(
        _.filter<NodeJS.CallSite>(v=>config.errorBlacklist.every(c => v.getFileName() && v.getFileName().search(c)==-1)),
        _.drop(1+errorDepth),
        _.map(v => {
            const pathMatch=v.getFileName().match(new RegExp("(?:[\\\\\\/][^\\\\\\/]*){1,"+config.errorPathLength+"}$"))
            return {
                func:v.getFunctionName() ? v.getFunctionName() : "Object.<anonymous>",
                file:pathMatch && "..."+pathMatch[0],
                line:v.getLineNumber(),
                col:v.getColumnNumber()
            }
        }),
        _.filter(v => v!=null),
        _.map(v => chalk.red(v.func)+chalk.bold.redBright(" ("+v.file+":"+v.line+":"+v.col+")")+";"),
        _.reduce((o,c) => c+o,"")
    )(stack())
}
export function callFieldReferences<T>(field:any,func:(a:Generatable)=>T):T[]{
    if(typeof field == "object"){
        if(field instanceof Generatable){
            return [func(field)]
        }
        return _.flatMap(v => callFieldReferences(v,func),field)
    }
    return [];
}
export function prepareQueueBase(mod:modulePreparable,path:pathItem,ref:boolean,res:TopLevelGeneratable){
    if(ref){
        mod.resources.add(new refPlaceholder(res,path))
    }else{
        if(res[s_path]!==undefined){
            throw res[stacktrace]+"\nmultiple attempted creations"
        }
        res[s_path]=path
    }
    if(!mod.resources.has(res)){
        mod.resources.add(res)
        return true
    }else{
        return false
    }
}
export function cleanTextForIdentifier(s:string){
    return s//TODO convert to valid Terraform identifier
}
export function generateUniqueIdentifier(path:pathItem):string{
    if(path instanceof Array){
        return path.map(_.flow(
            cleanTextForIdentifier,
            _.capitalize
        )).join()
    }else{
        //TODO make smarter
        const rec=(rPath:pathItem)=>{
            if(rPath instanceof Array){
                return rPath.map(_.flow(
                    cleanTextForIdentifier,
                    _.capitalize
                )).join("")
            }else{
                return rec(rPath[s_path])
            }
        }
        return rec(path)
    }
}