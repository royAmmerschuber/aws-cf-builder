import { Generatable, SMap, Preparable, PreparableError } from "./general"
import _ from "lodash/fp"
import { s_path, pathName } from "./symbols"
import { stackPreparable } from "./stackBackend"
import { refPlaceholder } from "./refPlaceholder"
import { pathItem } from "./path"
import { Field } from "./field"
import { Resource } from "./generatables/resource"

export function prepareQueueBase(stack:stackPreparable,path:pathItem,ref:boolean,res:Generatable){
    if(ref){
        stack.resources.add(new refPlaceholder(res,path))
    }else{
        if(res[s_path]!==undefined){
            throw new PreparableError(res,"multiple attempted creations")
        }
        res[s_path]=path
        stack.resources.add(res)
    }
    return !ref
}
export function cleanTextForIdentifier(s:string){
    return s//TODO convert to valid Terraform identifier
}
export const generateUniqueIdentifier:(path: pathItem) => string=_.memoize(function generateUniqueIdentifier(path:pathItem):string{
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
export function findInPath<T extends findInPath.tType>(path:pathItem,objects:T):findInPath.out<T>{
    const opt=_.toPairs(objects)
    const out:SMap<{depth:number,obj:Preparable}>={}
    let p:pathItem=path
    let depth=0
    while(!(p instanceof Array)){
        depth++
        opt.forEach(([k,constr])=>{
            if(k in out) return;
            if(p instanceof constr){
                out[k]={
                    depth:depth,
                    obj:p
                }
            }
        })
        p=p[s_path]
    }
    return out as any
}
namespace findInPath{
    export type tType=SMap<new (...args)=>Preparable>
    export type out<T extends tType>={
        [K in keyof T]?:{
            depth:number,
            obj:T[K] extends new (...args)=>infer P 
                ? P 
                : never
        }
    }
}

export function callOn<U>(container:any,instanceOf:typeof Preparable,iter:(obj:Preparable)=>U):U[]
export function callOn<T,U>(container:any,instanceOf:new (...args)=>T,iter:(obj:T)=>U):U[]
export function callOn<T,U>(container:any,instanceOf:new (...args)=>T|typeof Preparable,iter:(obj:T|Preparable)=>U):U[]{
    if(typeof container=="object"){
        if(container instanceof instanceOf){
            return [iter(container as T)]
        }else{
            return _.flatMap(
                v => callOn(v,instanceOf as new (...args)=>T,iter),
                container
            )
        }
    }
}
export function notEmpty<T extends string|object>(t:T):T|undefined{
    if(_.size(t)){
        return t
    }
}
export type Ref<T extends Resource>=T | Field<string>
export namespace Ref{
    export function get<T extends Resource>(ref:Ref<T>){
        return ref instanceof Resource
            ? ref.r
            : ref
    }
}
export type Attr<T extends Resource|string>=T extends string 
    ? ( Resource & {a:{[k in T]:Field<string>}} | Field<string>)
    : ( T | Field<string>)
export namespace Attr{
    export function get<T extends string>(cont:Attr<T>,attr:T):Field<string>{
        if(cont instanceof Resource){
            return (cont as any).a[attr]
        }else{
            return cont as Field<string>
        }
    }
}