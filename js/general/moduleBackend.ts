import { checkCache, checkValid, prepareQueue, resourceIdentifier, stacktrace, s_path, generateObject, getName } from "./symbols"
import { SMap, ResourceError, pathItem, Generatable } from "./general"
import _ from "lodash/fp"
import { Provider, provSym } from "./generatables/provider"
import { Resource } from "./generatables/resource"
import { Output } from "./generatables/output"
import { Variable } from "./generatables/variable"
import { refPlaceholder } from "./refPlaceholder"
import chalk from "chalk"

export class ModuleBackend{
    private static readonly moduleCache:Map<any,ModuleBackend>=new Map()
    private [checkCache]:SMap<ResourceError>
    static readonly sym=Symbol("moduleBackend")
    private resources:{path:string[],resource:Generatable}[]
    private preparable:modulePreparable
    constructor(file:any){
        const cacheResult=ModuleBackend.moduleCache.get(file)
        if(cacheResult!==undefined){
            return cacheResult
        }
        ModuleBackend.moduleCache.set(file,this)
        
        this.resources=getResources(file)
    }
    checkValid():SMap<ResourceError>{
        if(this[checkCache]){
            return this[checkCache]
        }
        const out:SMap<ResourceError>={}
        
        return this[checkCache]=this.resources
            .map(res => res.resource[checkValid]())
            .reduce((o,c)=>_.assign(o,c),out)
    }
    prepareQueue(moduleSet:Set<ModuleBackend>){
        if(!moduleSet.has(this)){
            moduleSet.add(this)
            const preparable:modulePreparable={
                moduleBackends:moduleSet,
                resources:new Set(),
            }
            this.resources.forEach(res => {
                res.resource[prepareQueue](preparable,res.path,false)
            })
            //cleaning out Refs & storing refs in temporary map
            const missingRefs=new Map<Generatable,pathItem[]>()
            preparable.resources.forEach(resource => {
                if(resource instanceof refPlaceholder){
                    if(resource.ref[s_path]===undefined){
                        const refArray=missingRefs.get(resource.ref)
                        if(refArray){
                            refArray.push(resource.path)
                        }else{
                            missingRefs.set(resource.ref,[resource.path])
                        }
                    }
                    preparable.resources.delete(resource)
                }
            })
            //add main refs for missings
            missingRefs.forEach((refs,resource) => {
                resource[prepareQueue](preparable,dissolvePaths(refs,resource),false)
                preparable.resources.add(resource)
            })
            this.preparable=preparable
        }
    }
    generateObject():generationOutput{
        //*sort
        const providers:Map<string,Provider[]>=new Map()
        const resources:Map<string,Resource[]>=new Map()
        const outputs:Output<any>[]=[]
        const variables:Variable<any>[]=[]
        this.preparable.resources.forEach(res => {
            if(res instanceof Provider){
                const arr=providers.get(res[resourceIdentifier])
                if(arr){
                    arr.push(res)
                }else{
                    providers.set(res[resourceIdentifier],[res])
                }
            }else if(res instanceof Resource){
                const arr=resources.get(res[resourceIdentifier])
                if(arr){
                    arr.push(res)
                }else{
                    resources.set(res[resourceIdentifier],[res])
                }
            }else if(res instanceof Output){
                outputs.push(res)
            }else if(res instanceof Variable){
                variables.push(res)
            }
        })
        //*clean
        providers.forEach(provs => {
            const def=provs.reduce((prov,mostRefs) => {
                if(mostRefs===undefined || prov[provSym.numberOfRefs]==mostRefs[provSym.numberOfRefs]){
                    return undefined
                }else if(prov[provSym.numberOfRefs]>mostRefs[provSym.numberOfRefs]){
                    return prov
                }else {
                    return mostRefs
                }
            })
            def[provSym.isDefault]=true
        })
        //*generate
        return {
            provider:_.flow(
                _.map((_v:[string,Provider[]]) => {
                    const k=_v[0],v=_v[1]
                    if(v.length>1){
                        return [k,v.map(prov => prov[generateObject]())]
                    }else{
                        return [k,v[0][generateObject]()]
                    }
                }),
                _.fromPairs
            )([...providers]),
            resource:_.flow(
                _.map((v:[string,Resource[]]) => [v[0],_.flow(
                    _.map((res:Resource) => [res[getName](),res[generateObject]()] ),
                    _.fromPairs
                )(v[1])]),
                _.fromPairs
            )([...resources]),
           output:_.flow(
                _.map((out:Output<any>) => [out[getName](),out[generateObject]()]),
                _.fromPairs
            )(outputs),
            variable:_.flow(
                _.map((va:Variable<any>) => [va[getName](),va[generateObject]()]),
                _.fromPairs
            )(variables) 
        }
    }
}

export interface modulePreparable{
    moduleBackends:Set<ModuleBackend>
    resources:Set<Generatable|refPlaceholder<Generatable>>
}

function getResources(file:any):{path:string[],resource:Generatable}[]{
    const rec=(path:string[],obj:any) => {
        const out=[]
        for(const k in obj){
            const v=obj[k]
            if(typeof v=="object"){
                if(v instanceof Generatable){
                    out.push({
                        path:[...path,k],
                        resource:v
                    })
                }else{
                    out.push(...rec([...path,k],v))
                }
            }
        }
        return out
    }
    const out=[]
    out.push(...rec([],file))
    return out
}
function dissolvePaths(paths:pathItem[],resource:Generatable):pathItem{
    if(paths.length>1){
        //TODO do something smart for path resolving
        if(resource instanceof Provider){
            return paths[0]
        }
        throw resource[stacktrace]+"\n"+chalk.yellow(resource[resourceIdentifier])+"\nmultiple references to resource"
    }else{
        return paths[0]
    }
}
interface generationOutput{
    provider?:SMap<any[]|any>
    resource?:SMap<SMap<any>>
    variable?:SMap<any>
    output?:SMap<any>
}