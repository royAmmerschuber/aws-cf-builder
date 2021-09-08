import { SourceFile, PropertyType, Property, PrimitiveType } from "../source/types";
import { Project } from "ts-morph"
import _ from "lodash/fp"
import { generateResource } from "./genResource";

const {PropertyTypes,ResourceTypes}:SourceFile=require("../source/CloudFormationResourceSpecification.json")

export const project=new Project()
const hierarchical=makeHierarchichal()
const filtered=_.fromPairs(_.toPairs(hierarchical)
    .filter(v=>v[0].startsWith("AWS::ApiGateway::"))
)
// throw "yo"
// console.log(filtered)
for(const k in filtered){
    const v=filtered[k]
    generateResource(k,v)

}
export interface ResourceDef{
    identifier:string
    doc:string
    properties:Record<string,PropertyRef>
    attributes:Record<string,AttributeRef>
    propertyDefs:Record<string,PropertyDef>
}
export interface PropertyDef{
    identifier:string
    doc:string
    properties:Record<string,PropertyRef>
    resource:ResourceDef
}
export type AttributeRef=any
export type PropertyRef= PropertyRef.Primitive|PropertyRef.Complex|PropertyRef.ComplexCollection|PropertyRef.PrimitiveCollection
export namespace PropertyRef{
    interface Base{
        doc:string
        req:boolean,
        update:"Mutable"|"Immutable"
    }
    export interface Primitive extends Base{
        kind:"Primitive"
        type:PrimitiveType
    }
    export interface Complex extends Base{
        kind:"Complex"
        type:string
        def:PropertyDef
    }
    export interface PrimitiveCollection extends Base{
        kind:"PrimitiveCollection"
        collection:"Map"|"List"
        type:PrimitiveType
    }
    export interface ComplexCollection extends Base{
        kind:"ComplexCollection"
        collection:"Map"|"List"
        type:string
        def:PropertyDef
    }
}
function makeHierarchichal(){
    const remapped:Record<string,ResourceDef>=_.fromPairs(_.toPairs(ResourceTypes).map(([resId, resType])=>{
        const propertyDefs=new Map<Property ,PropertyDef>()
        function generatePropDef(prop:Property.Complex|Property.ComplexCollection):PropertyDef{
            if(propertyDefs.has(prop)) return propertyDefs.get(prop)
            const propDef= "ItemType" in prop
                ? PropertyTypes[`${resId}.${prop.ItemType}`] ?? PropertyTypes[prop.ItemType]
                : PropertyTypes[`${resId}.${prop.Type}`] ?? PropertyTypes[prop.Type]
            if(!propDef){
                console.log(prop.Type,JSON.stringify(prop))
                return
            }
            const out:PropertyDef={
                doc:propDef.Documentation,
                properties:undefined,
                identifier:"ItemType" in prop
                    ? prop.ItemType
                    : prop.Type,
                resource:undefined
            }
            propertyDefs.set(prop,out)
            out.properties=handleProps(propDef)
            return out
        }
        function handleProps(def:PropertyType){
            return _.fromPairs(_.toPairs(def.Properties).map(([name,def])=>{
                const base={
                    doc:def.Documentation,
                    req:def.Required,
                    update:def.UpdateType,
                }
                if("PrimitiveType" in def){
                    return [name,{
                        ...base,
                        kind:"Primitive",
                        type:def.PrimitiveType
                    } as PropertyRef]
                }else if("PrimitiveItemType" in def){
                    return [name,{
                        ...base,
                        kind:"PrimitiveCollection",
                        type:def.PrimitiveItemType,
                        collection:def.Type
                    } as PropertyRef]
                }else if("ItemType" in def){
                    if(["Json","Map","List"].includes(def.ItemType)){
                        return [name, {
                            ...base,
                            kind:"Primitive",
                            collection:def.Type,
                            type:"Json",
                        } as PropertyRef]
                    }
                    return [name,{
                        ...base,
                        kind:"ComplexCollection",
                        type:def.ItemType,
                        collection:def.Type,
                        def:generatePropDef(def)
                    } as PropertyRef]
                }else if("Type" in def){
                    return [name,{
                        ...base,
                        kind:"Complex",
                        type:def.Type,
                        def:generatePropDef(def)
                    } as PropertyRef]
                }else{
                    return [name,{
                        ...base,
                        kind:"Primitive",
                        type:"Json",
                    } as PropertyRef]
                }
            }))
        }
        const resDef:ResourceDef={
            doc:resType.Documentation,
            identifier:resId,
            properties:handleProps(resType),
            propertyDefs:_.fromPairs([...propertyDefs.values()].map(def=> [def.identifier,def] )),
            attributes:{},
        }
        propertyDefs.forEach(def=>{
            def.resource=resDef
        })
        return [resId, resDef]
    }))
    return remapped
}
