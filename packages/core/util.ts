import { Generatable, SMap, Preparable, PreparableError, ResourceError } from "./general"
import _ from "lodash/fp"
import { s_path, pathName, prepareQueue, checkValid, s_isAliased, toJson } from "./symbols"
import { stackPreparable } from "./stackBackend"
import { refPlaceholder } from "./refPlaceholder"
import { pathItem,namedPath } from "./path"
import { Field } from "./field"
import { Resource } from "./generatables/resource"

export function applyToJson(obj:any){
    const circular=new WeakSet()
    function rec(obj:any){
        if(typeof obj =="object"){
            if(circular.has(obj)) throw new Error("circular")
            circular.add(obj)
            let out:any
            if(obj[toJson] instanceof Function) out=rec(obj[toJson]())
            else if(obj instanceof Array) out = obj.map(v => rec(v))
            else out=_.mapValues((v)=>rec(v),obj)
            circular.delete(obj)
            return out
        }
        return obj
    }
    return rec(obj)
}
export function prepareQueueBase(stack: stackPreparable, path: pathItem, ref: boolean, res: Generatable) {
    if (ref) {
        stack.resources.add(new refPlaceholder(res, path))
    } else {
        if (res[s_path] !== undefined) {
            if(res[s_isAliased]) return;
            const name1=generateUniqueIdentifier(res);
            const fake:pathItem=pathName in res ? {
                [s_path]:path,
                [pathName]:()=>res[pathName]()
            } as namedPath: path
            const name2=generateUniqueIdentifier(fake)
            throw new PreparableError(res, `trying to create the same resource under name "${name1}" and "${name2}"`)
        }
        res[s_path] = path
        stack.resources.add(res)
    }
    return !ref
}
export function cleanTextForIdentifier(s: string) {
    return s.replace(/[^a-zA-Z0-9]+/g,"")
}
export const generateUniqueIdentifier = _.memoize(function _generateUniqueIdentifier(path: pathItem): string {
    if (path instanceof Array) {
        return path.map(_.flow(
            cleanTextForIdentifier,
            _.capitalize
        )).join("")
    } else if (pathName in path) {
        return generateUniqueIdentifier(path[s_path]) + cleanTextForIdentifier(path[pathName]())
    } else {
        return generateUniqueIdentifier(path[s_path])
    }
})
export function findInPath<T extends findInPath.tType>(path: pathItem, objects: T): findInPath.out<T> {
    const opt = _.toPairs(objects)
    const out: SMap<{ depth: number, obj: Preparable }> = {}
    let p: pathItem = path
    let depth = 0
    while (!(p instanceof Array)) {
        depth++
        opt.forEach(([k, constr]) => {
            if (k in out) return;
            if (p instanceof constr) {
                out[k] = {
                    depth: depth,
                    obj: p
                }
            }
        })
        p = p[s_path]
    }
    return out as any
}
namespace findInPath {
    export type tType = SMap<new (...args) => Preparable>
    export type out<T extends tType> = {
        [K in keyof T]?: {
            depth: number,
            obj: T[K] extends new (...args) => infer P
            ? P
            : never
        }
    }
}

export function callOn<U>(container: any, instanceOf: typeof Preparable, iter: (obj: Preparable) => U): U[]
export function callOn<T, U>(container: any, instanceOf: new (...args) => T, iter: (obj: T) => U): U[]
export function callOn<T, U>(container: any, instanceOf: new (...args) => T | typeof Preparable, iter: (obj: T | Preparable) => U): U[] {
    if (container instanceof instanceOf) {
        return [iter(container as T)]
    } else if (container instanceof Map) {
        const coll: U[][] = []
        container.forEach((v, k) => {
            coll.push(
                callOn<any, U>(v, instanceOf, iter),
                callOn<any, U>(k, instanceOf, iter)
            )
        })
        return _.flatten(coll)
    } else if (container instanceof Set) {
        const coll: any[][] = []
        container.forEach(v => {
            coll.push(callOn<any, any>(v, instanceOf, iter))
        })
        return _.flatten(coll)
    } else if (container instanceof Array || typeof container == "object") {
        return _.flatMap(
            v => callOn<any, any>(v, instanceOf, iter),
            container
        )
    } else {
        return []
    }
}
export function callOnPrepareQueue(container: any, stack: stackPreparable, path: pathItem, ref: boolean) {
    return callOn(container, Preparable, o => o[prepareQueue](stack, path, ref))
}
export function callOnCheckValid(container: any, out: SMap<ResourceError>): SMap<ResourceError> {
    return callOn(container, Preparable, o => o[checkValid]())
        .reduce<SMap<ResourceError>>(_.assign, out)
}
export function notEmpty<T extends string | object>(t: T): T | undefined {
    if (_.size(t)) {
        return t
    }
}
export type Ref<T extends Resource> = T | Field<string>
export namespace Ref {
    export function get<T extends Resource>(ref: Ref<T>) {
        return ref instanceof Resource
            ? ref.r
            : ref
    }
}
export type Attr<T extends Resource | string> = T extends string
    ? (Resource & { a: { [k in T]: Field<string> } } | Field<string>)
    : (T | Field<string>)
export namespace Attr {
    export function get<T extends string>(cont: Attr<T>, attr: T): Field<string> {
        if (cont instanceof Resource) {
            return (cont as any).a[attr]
        } else {
            return cont as Field<string>
        }
    }
}
export function thrw(err:Error):never{
    throw err
}