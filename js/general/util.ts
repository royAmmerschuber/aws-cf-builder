import { pathItem, Generatable } from "./general"
import _ from "lodash/fp"
import { s_path, stacktrace } from "./symbols"
import { modulePreparable } from "./moduleBackend"
import { refPlaceholder } from "./refPlaceholder"

export function prepareQueueBase(mod:modulePreparable,path:pathItem,ref:boolean,res:Generatable){
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
export const generateUniqueIdentifier=_.memoize(function generateUniqueIdentifier(path:pathItem):string{
    if(path instanceof Array){
        return path.map(_.flow(
            cleanTextForIdentifier,
            _.capitalize
        )).join("")
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
})