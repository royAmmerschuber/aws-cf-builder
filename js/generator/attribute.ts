import { Type, SchemaBaseData } from "./baseDataDef"
import _ from "lodash"
import { SMap } from "../general/general"

export abstract class Attribute{
    abstract generateParameter():string
    // abstract generateSetter():string
    // abstract generateGenerate():string
    // abstract generateCheck():string
    // abstract generateInterfaceProp():string
    // abstract getInterfaces():string
}
export class BasicAttribute extends Attribute{
    private identifier: string
    typeName: any
    constructor(
        private name:string,
        private type:Type
    ){
        super()
        this.identifier="_"+_.camelCase(name)
        switch(this.type){
            case Type.TypeBool:this.typeName="boolean"
            case Type.TypeInt:this.typeName="number"
            case Type.TypeFloat:this.typeName="number"
            case Type.TypeString:this.typeName="string"
        }
    }
    generateParameter(){
        return `private ${this.identifier}:Field<${this.typeName}>\n`
    }
}
export function generateAttributes(baseData:SMap<SchemaBaseData<Type>>):Attribute[]{
    const out:Attribute[]=[]
    _.forEach(baseData,(v,k)=>{
        switch(v.Type){
            case Type.TypeBool,Type.TypeFloat,Type.TypeInt,Type.TypeString:
                out.push(new BasicAttribute(k,v.Type))
                break;
            case Type.TypeList,Type.TypeList:

            default:
        }
    })
    return out
}