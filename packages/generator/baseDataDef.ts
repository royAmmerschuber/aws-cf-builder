import { SMap } from "../general/general";

export interface ResourceBaseData{
    Schema:SMap<SchemaBaseData<Type>>
    SchemaVersion:0,
    Importer?:{},
    DeprecationMessage:string,
    Timeouts?:{
        Create:number,
        Read:number,
        Update:number,
        Delete:number,
        Default:number,
    }
} 
export interface ProviderBaseData{
    [k:string]:SchemaBaseData<Type>
}
export interface SchemaBaseData<T extends Type>{
    Type:T
    Optional:boolean
    Required:boolean
    Default:typeOfType<T>
    Description:string
    InputDefualt:string
    Computed:boolean
    ForceNew:boolean
    Elem:SchemaBaseData<Type>
    MaxItems:number
    MinItems:number
    PromoteSingle:boolean
    ComputedWhen:string[]
    ConflictsWith:string[]
    Deprecated:string
    Removed:string
    Sensitive:boolean
}
export enum Type{
    TypeInvalid,
    TypeBool,
	TypeInt,
	TypeFloat,
	TypeString,
	TypeList,
	TypeMap,
	TypeSet,
	typeObject
}
export type typeOfType<T extends Type>=
    T extends Type.TypeBool ? boolean :
    T extends Type.TypeInt ? number :
    T extends Type.TypeFloat ? number :
    T extends Type.TypeString ? string :
    T extends Type.TypeList ? [] :
    T extends Type.TypeMap ? {} :
    T extends Type.TypeSet ? [] :
    T extends Type.typeObject ? {} :
    unknown