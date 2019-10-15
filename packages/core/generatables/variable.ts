import { SMap, ResourceError, pathItem } from "../general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, getName, s_path, generateExpression } from "../symbols";
import { modulePreparable } from "../moduleBackend";
import { prepareQueueBase, generateUniqueIdentifier } from "../util";
import { GeneratableAdvField } from "../field";
export type TypeDefinition<T>=T extends string ? "string" : string

export class Variable<T> extends GeneratableAdvField<T>{
    readonly [resourceIdentifier]:"variable"
    private _:{
        name:string
        type:TypeDefinition<T>,
        default:T,
        description:string
    }={} as any
    constructor(name?:string,type?:TypeDefinition<T>){
        super(0)
        this._.name=name
        this._.type=type
    }
    name(name:string):this{
        this._.name=name
        return this
    }
    type<U>(type:TypeDefinition<U>):U extends T ? T extends U ? this : Variable<U> : Variable<U>{
        this._.type=type as any
        return this as any
    }
    default(def:T):this{
        this._.default=def
        return this
    }
    description(text:string){
        this._.description=text
        return this
    }
    [checkValid](): SMap<ResourceError> {
        return {}
    }
    [prepareQueue](mod: modulePreparable, path: pathItem,ref:boolean): void {
        prepareQueueBase(mod,path,ref,this)
    }
    [generateExpression](){
        return `var.${this[getName]()}`
    }
    [generateObject]() {
        return {
            type:this._.type,
            default:this._.default,
            description:this._.description
        }
    }
    [getName](){
        return this._.name || generateUniqueIdentifier(this[s_path])
    }
}