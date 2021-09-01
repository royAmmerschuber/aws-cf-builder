export interface SourceFile{
    ResourceSpecificationVersion:string
    ResourceTypes:Record<string,ResourceType>
    PropertyTypes:Record<string,PropertyType>
}
export interface PropertyType{
    Documentation:string
    Properties:Record<string,Property>
}
export interface ResourceType extends PropertyType{
    Attributes:Record<string,Attribute>
}
export type AttrPrimitiveType=
    "String" |
    "Long" |
    "Integer" |
    "Double" |
    "Boolean" |
    "Timestamp"
export type PrimitiveType=AttrPrimitiveType |
    "Json"
export type Property=Property.Primitive|Property.Complex|Property.PrimitiveCollection|Property.ComplexCollection
export namespace Property{
    interface Base{
        Documentation:string
        Required:boolean
        UpdateType:"Mutable"|"Immutable"|"Conditional"
    }
    export interface Primitive extends Base{
        PrimitiveType:PrimitiveType
    }
    export interface Complex extends Base{
        Type:string
    }
    export interface PrimitiveCollection extends Base{
        Type:"List"|"Map"
        DuplicatesAllowed:boolean
        PrimitiveItemType:PrimitiveType
    }
    export interface ComplexCollection extends Base{
        Type:"List"|"Map"
        DuplicatesAllowed:boolean
        ItemType:string
    }
}
export type Attribute=Attribute.Primitive|Attribute.Complex|Attribute.PrimitiveCollection|Attribute.ComplexCollection
export namespace Attribute{
    export interface PrimitiveCollection{
        Type:"List"
        PrimitiveItemType:AttrPrimitiveType
    }
    export interface ComplexCollection{
        Type:"List"
        ItemType:string
    }
    export interface Primitive{
        PrimitiveType:AttrPrimitiveType
    }
    export interface Complex{
        Type:string
    }
}
