import { checkCache, checkValid, prepareQueue, s_path, generateObject, getName } from "./symbols"
import { SMap, ResourceError, Generatable, PreparableError, Preparable } from "./general"
import _ from "lodash/fp"
import { Resource } from "./generatables/resource"
import { Output } from "./generatables/output"
import { Parameter } from "./generatables/parameter"
import { refPlaceholder } from "./refPlaceholder"
import chalk from "chalk"
import { pathItem } from "./path"
import { applyToJson } from "./util"

export class StackBackend {
    private static readonly moduleCache: Map<any, StackBackend> = new Map()
    private [checkCache]: SMap<ResourceError>
    static readonly sym = Symbol("moduleBackend")
    private resources: { path: string[], resource: Generatable }[]
    private preparable: stackPreparable
    constructor(file: any) {
        const cacheResult = StackBackend.moduleCache.get(file)
        if (cacheResult !== undefined) {
            return cacheResult
        }
        StackBackend.moduleCache.set(file, this)

        this.resources = getResources(file)
    }
    checkValid(): SMap<ResourceError> {
        if (this[checkCache]) {
            return this[checkCache]
        }
        const out: SMap<ResourceError> = {}

        return this[checkCache] = this.resources
            .map(res => res.resource[checkValid]())
            .reduce((o, c) => _.assign(o, c), out)
    }
    prepareQueue(moduleSet: Set<StackBackend>) {
        if (!moduleSet.has(this)) {
            moduleSet.add(this)
            const preparable: stackPreparable = {
                moduleBackends: moduleSet,
                resources: new Set(),
            }
            this.resources.forEach(res => {
                res.resource[prepareQueue](preparable, res.path, false)
            })
            //unfolding refs recursively
            const rec = (resources: Set<refPlaceholder<Generatable> | Generatable>) => {
                const missingRefs = new Map<Generatable, pathItem[]>()
                resources.forEach(resource => {
                    if (resource instanceof refPlaceholder) {
                        if (resource.ref[s_path] === undefined) {
                            const refArray = missingRefs.get(resource.ref)
                            if (refArray) {
                                refArray.push(resource.path)
                            } else {
                                missingRefs.set(resource.ref, [resource.path])
                            }
                        }
                        resources.delete(resource)
                    }
                })
                resources.forEach(res => preparable.resources.add(res))
                //reiterating missing
                if (missingRefs.size) {
                    const prep: stackPreparable = {
                        moduleBackends: moduleSet,
                        resources: new Set()
                    }
                    missingRefs.forEach((refs, resource) => {
                        resource[prepareQueue](prep, dissolvePaths(refs, resource), false)
                    })
                    rec(prep.resources)
                }
            }
            rec(preparable.resources)
            this.preparable = preparable
        }
    }
    generateObject(): generationOutput {
        //*sort
        const resources: Resource[] = []
        const outputs: Output<any>[] = []
        const parameters: Parameter<any>[] = []
        this.preparable.resources.forEach(res => {
            if (res instanceof Resource) {
                resources.push(res)
            } else if (res instanceof Output) {
                outputs.push(res)
            } else if (res instanceof Parameter) {
                parameters.push(res)
            }
        })
        //*clean
        //noop
        //*generate
        const errors = []
        const used = new Map<string, {g:Generatable,duped:boolean}>()
        const out = {
            AWSTemplateFormatVersion: "2010-09-09",
            Resources: _.flow(
                _.map((v: Resource) => {
                    const name = v[getName]()
                    const dupe=used.get(name)
                    if (dupe) {
                        errors.push(new PreparableError(v, chalk`duplicate generated Identifier: {bold ${name}}`))
                        if(!dupe.duped){
                            errors.push(new PreparableError(dupe.g, chalk`duplicate generated Identifier: {bold ${name}}`))
                            dupe.duped=true
                        }
                    }else{
                        used.set(name, {g:v,duped:false})
                    }
                    const obj = v[generateObject]()
                    return [name, obj]
                }),
                _.fromPairs
            )(resources),
            Parameters: (() => {
                const p = _.flow(
                    _.map((v: Parameter<any>) => {
                        const name = v[getName]()
                        const dupe=used.get(name)
                        if (dupe) {
                            errors.push(new PreparableError(v,chalk`duplicate generated Identifier: {bold ${name}}`))
                            if(!dupe.duped){
                                errors.push(new PreparableError(dupe.g, chalk`duplicate generated Identifier: {bold ${name}}`))
                                dupe.duped=true
                            }
                        }else{
                            used.set(name, {g:v,duped:false})
                        }
                        const obj = v[generateObject]()
                        return [name, obj]
                    }),
                    _.fromPairs
                )(parameters)
                return _.size(p) ? p : undefined
            })(),
            Outputs: (() => {
                const o = _.flow(
                    _.map((v: Output<any>) => [v[getName](), v[generateObject]()]),
                    _.fromPairs
                )(outputs)
                return _.size(o) ? o : undefined
            })()
        }
        if(errors.length){
            throw errors
        }
        return applyToJson(out)
    }
}

export interface stackPreparable {
    moduleBackends: Set<StackBackend>
    resources: Set<Generatable | refPlaceholder<Generatable>>
}

function getResources(file: any): { path: string[], resource: Generatable }[] {
    const rec = (path: string[], obj: any) => {
        const out = []
        for (const k in obj) {
            const v = obj[k]
            if (typeof v == "object") {
                if(v instanceof Preparable){
                    if (v instanceof Generatable) {
                        out.push({
                            path: [...path, k],
                            resource: v
                        })
                    }
                } else {
                    out.push(...rec([...path, k], v))
                }
            }
        }
        return out
    }
    const out = []
    out.push(...rec([], file))
    return out
}
function dissolvePaths(paths: pathItem[], resource: Generatable): pathItem {
    if (paths.length > 1) {
        //TODO do something smart for path resolving
        const depths=new Map<pathItem|"path",number[]>()
        paths.forEach(v=>{
            let i=0
            for(let it:pathItem=v;!(it instanceof Array);it=it[s_path],i++){
                const d=depths.get(it)
                if(!d){
                    depths.set(it,[i])
                }else{
                    d.push(i)
                }
            }
            const d=depths.get("path")
            if(!d){
                depths.set("path",[i])
            }else{
                d.push(i)
            }
        })
        let shortestDepth=Infinity
        let shortest:pathItem|"path"
        ;[...depths]
            .filter(([k,v])=>v.length==paths.length)
            .forEach(([k,v])=>{
                const depthSum=v.reduce((o,c)=>o+c,0)
                if(depthSum<shortestDepth){
                    shortestDepth=depthSum
                    shortest=k
                }
            })
        if(shortest=="path"){
            throw new PreparableError(resource,"multiple references to resource")
        }
        return shortest
    } else {
        return paths[0]
    }
}
interface generationOutput {
    AWSTemplateFormatVersion: string,
    Transform?:string
    Description?: string,
    Parameters?: SMap<any>,
    Resources: SMap<any>,
    Outputs?: SMap<any>
}