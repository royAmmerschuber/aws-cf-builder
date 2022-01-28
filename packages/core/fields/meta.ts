import { Resource } from "../generatables/resource";
import { generateObject, getName } from "../symbols";

export interface MetaProperties{
    resource:Resource
    dependsOn?:Resource[]
    creationPolicy?:any
    deletionPolicy?:any
    metadata?:any
    updatePolicy?:any
    updateReplacePolicy?:any
}
export const S_metadata=Symbol("S_metadata")
export function Meta({resource,...props}:MetaProperties):Resource{
    resource[S_metadata]=props
    const oldFunc=resource[generateObject]
    resource[generateObject]=function(this:Resource){
        return applyMetaFunc(this,oldFunc,props)
    }
    return resource
}
export function applyMetaFunc(resource:Resource,oldFunc:()=>any,props:Omit<MetaProperties,"resource">){
    return {
        ...oldFunc.call(resource),
        DependsOn:props.dependsOn?.map(v=>v[getName]()),
        CreationPolicy:props.creationPolicy,
        DeletionPolicy:props.deletionPolicy,
        Metadata:props.metadata,
        UpdatePolicy:props.updatePolicy,
        UpdateReplacePolicy:props.updateReplacePolicy
    }
}
