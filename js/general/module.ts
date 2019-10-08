import _ from "lodash/fp";
import { SMap, ResourceError, pathItem, TopLevelGeneratable } from "./general";
import { RefFilterByOutput, FilterInputToSetter } from "./moduleTypes";
import { generateObject, prepareQueue, checkValid, resourceIdentifier, checkCache, resourceName } from "./symbols";
import { ModuleBackend, modulePreparable } from "./moduleBackend";
import { prepareQueueBase } from "./util";
export class $module<T> extends TopLevelGeneratable{
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
    [prepareQueue](mod:modulePreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(mod,path,ref,this)){
            this[ModuleBackend.sym].prepareQueue(mod.moduleBackends)
        }
    }
    [generateObject](){
        throw "not implemented"
    }
}

export type Module<T>=$module<T> & FilterInputToSetter<T,T>
export function Module<T extends SMap<any>>(file:T):Module<T>{
    const backend=new ModuleBackend(file)
    const mod=new $module(backend)
    return mod as any
}
