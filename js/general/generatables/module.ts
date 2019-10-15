import _ from "lodash/fp";
import { SMap, ResourceError, pathItem, Generatable } from "../general";
import { RefFilterByOutput } from "../moduleTypes";
import { generateObject, prepareQueue, checkValid, resourceIdentifier, checkCache, resourceName } from "../symbols";
import { ModuleBackend, modulePreparable } from "../moduleBackend";
import { prepareQueueBase } from "../util";
//TODO
export class Module<T> extends Generatable{
    readonly [resourceIdentifier]:string
    [resourceName]:string
    
    [ModuleBackend.sym]:ModuleBackend

    d:RefFilterByOutput<T>

    constructor(file:T){
        super(0)

        this[ModuleBackend.sym]=new ModuleBackend(file)
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