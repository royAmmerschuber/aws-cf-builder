import { pathItem, Generatable } from "./general"
import _ from "lodash/fp"
import { s_path, stacktrace, pathName } from "./symbols"
import { stackPreparable } from "./stackBackend"
import { refPlaceholder } from "./refPlaceholder"

export function prepareQueueBase(stack:stackPreparable,path:pathItem,ref:boolean,res:Generatable){
    if(ref){
        stack.resources.add(new refPlaceholder(res,path))
    }else{
        if(res[s_path]!==undefined){
            throw res[stacktrace]+"\nmultiple attempted creations"
        }
        res[s_path]=path
    }
    if(!stack.resources.has(res)){
        stack.resources.add(res)
        return true
    }else{
        return false
    }
}
export function cleanTextForIdentifier(s:string){
    return s//TODO convert to valid Terraform identifier
}
export const generateUniqueIdentifier=_.memoize(function generateUniqueIdentifier(path:pathItem):string{
    //TODO make smarter
    const rec=(rPath:pathItem):string=>{
        if(rPath instanceof Array){
            return rPath.map(_.flow(
                cleanTextForIdentifier,
                _.capitalize
            )).join("")
        }else if(pathName in rPath){
            return rec(rPath[s_path])+rPath[pathName]()
        }else{
            return rec(rPath[s_path])
        }
    }
    return rec(path)
})