import { OptionalKind, MethodDeclarationStructure, WriterFunction } from "ts-morph"
import { PropertyRef } from "."
import _ from "lodash/fp"
import { resolveDocs } from "./genResource"
type PropDecl=[string,string|WriterFunction]

interface PropertyResponse{
    prop:PropDecl
    out:PropDecl
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
        out:[identifier,`this._.${name}`],
        method:{
            name,
            parameters:[
                {name,type}
            ],
            docs:[{
                description:[
                    resolveDocs(def.doc).properties.get(identifier)?.description ?? "",
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
