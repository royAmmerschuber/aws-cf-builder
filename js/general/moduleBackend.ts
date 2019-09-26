import { checkCache, checkValid, prepareQueue } from "./symbols"
import { SMap, ResourceError, Generatable } from "./general"
import { modulePreparable } from "./module"
import _ from "lodash"

export class ModuleBackend{
    private static readonly moduleCache:{file:any,backend:ModuleBackend}[]=[]
    private [checkCache]:SMap<ResourceError>
    static readonly sym=Symbol("moduleBackend")
    resources:{path:string[],resource:Generatable}[]
    preparable:modulePreparable
    constructor(file:any){
        const cacheResult=ModuleBackend.moduleCache.find(v=>v.file===file)
        if(cacheResult!==undefined){
            return cacheResult.backend
        }
        ModuleBackend.moduleCache.push({
            backend:this,
            file:file
        })
        
        this.resources=getResources(file)
    }
    checkValid():SMap<ResourceError>{
        if(this[checkCache]){
            return this[checkCache]
        }
        const out:SMap<ResourceError>={}
        _.assign(out,...this.resources
            .map(res => res.resource[checkValid]()))
        return this[checkCache]=out
    }
    prepareQueue(moduleSet:Set<ModuleBackend>){
        if(!moduleSet.has(this)){
            moduleSet.add(this)
            const preparable:modulePreparable={
                moduleBackends:moduleSet,
                modules:new Set(),
                output:new Set(),
                providers:new Set(),
                resources:new Set(),
                variables:new Set()
            }
            const param={}
            this.resources.forEach(res => {
                res.resource[prepareQueue](preparable,param)
            })
            this.preparable=preparable
        }
    }
    generateObject():any{
        const out={}
        
    }
}

function getResources(file:any):{path:string[],resource:Generatable}[]{
    const rec=(path:string[],obj:any)=>{
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
