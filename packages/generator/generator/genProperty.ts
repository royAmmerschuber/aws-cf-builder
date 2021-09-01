import { OptionalKind, MethodDeclarationStructure, WriterFunction } from "ts-morph"
import { PropertyRef } from "."
import _ from "lodash/fp"
interface PropertyResponse{
    prop:[string,string|WriterFunction],
    method:OptionalKind<MethodDeclarationStructure>
}
export function generateProperty(identifier:string,def:PropertyRef):PropertyResponse{
    const cname=_.camelCase(identifier)
    if(def.kind=="Primitive"){
        return basicProp(cname,identifier,def)
    }
    return basicProp(cname,identifier,def)
}
function basicProp(name:string,identifier:string,def:PropertyRef):PropertyResponse{
    const type=def.type=="String" ? "Field<string>"
        : def.type=="Double" || def.type=="Integer" || def.type=="Long" ? "Field<number>"
        : def.type=="Boolean" ? "Field<boolean>"
        : "any"
    return {
        prop:[name,type],
        method:{
            name,
            parameters:[
                {name,type}
            ],
            docs:[{
                description:[
                    `**required**:${def.req}`,
                    "",
                    `**maps:**\`${identifier}\``
                ].join("\n"),
                tags:[
                    {tagName:"param",text:name}
                ]
            }],
            statements:[
                `this._.${name}=${name}`,
                "return this"
            ],
        }
    }

}
