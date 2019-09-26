import _ from "lodash";
import { SMap, ResourceError, Generatable } from "./general";
import { RefFilterByOutput, FilterInputToSetter } from "./moduleTypes";
import { generateObject, prepareQueue, checkValid, resourceIdentifier, checkCache, resourceName } from "./symbols";
import { Resource } from "./resource";
import { Variable } from "./variable";
import { Output } from "./output";
import { Provider } from "./provider";
import { ModuleBackend } from "./moduleBackend";
class $module<T> extends Generatable{
    readonly [resourceIdentifier]:string
    [resourceName]:string
    
    [ModuleBackend.sym]:ModuleBackend

    d:RefFilterByOutput<T>

    constructor(backend:ModuleBackend){
        super(0)
        this[ModuleBackend.sym]=backend
    }

    [checkValid]():SMap<ResourceError>{
        if(this[checkCache]){
            return this[checkCache]
        }
        const out:SMap<ResourceError>={}
        _.assign(out,this[ModuleBackend.sym].checkValid())
        //TODO: check own imports
        return this[checkCache]=out
    }
    [prepareQueue](mod:modulePreparable,par:any){
        this[ModuleBackend.sym].prepareQueue(mod.moduleBackends)
        if(!mod.modules.has(this)){
            mod.modules.add(this)
        }
    }
    [generateObject](){
        throw "not implemented"
    }
}
export interface modulePreparable{
    moduleBackends:Set<ModuleBackend>
    modules:Set<$module<any>>
    resources:Set<Resource>
    variables:Set<Variable<any>>
    output:Set<Output<any>>
    providers:Set<Provider>
}

export type Module<T>=$module<T> & FilterInputToSetter<T,T>
export function Module<T extends SMap<any>>(file:T):Module<T>{
    const backend=new ModuleBackend(file)
    const mod=new $module(backend)
    return mod as any
}
