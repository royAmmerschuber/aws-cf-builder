import { project, ResourceDef, PropertyDef } from "."
import { generateProperty } from "./genProperty"
import _ from "lodash/fp"
import { Scope, Writers, ImportDeclarationStructure, OptionalKind } from "ts-morph"
const baseImports:OptionalKind<ImportDeclarationStructure>[]=[
    {moduleSpecifier:"aws-cf-builder/field",namedImports:["Field"]},
    {moduleSpecifier:"aws-cf-builder/symbols",namedImports:["checkValid", "stacktrace", "checkCache", "generateObject", "resourceIdentifier"]}
]
export function generateResource(identifier:string,def:ResourceDef){
    const [,domain,type]=identifier.split("::")
    const basePath=`./generated/${_.camelCase(domain)}/${_.camelCase(type)}`
    const src=_.size(def.propertyDefs)
        ? project.createSourceFile(`${basePath}/index.ts`,"",{overwrite:true})
        : project.createSourceFile(`${basePath}.ts`,"",{overwrite:true})
    for(const k in def.propertyDefs){
        generateAdvField(basePath,def.propertyDefs[k])
    }
    const props=Object.entries(def.properties).map(([name,def])=>generateProperty(name,def))
    src.addImportDeclarations(baseImports)
    src.addClass({
        name:type,
        extends:"Resource",
        isExported:true,
        properties:[
            {
                name:"[resourceIdentifier]",
                isReadonly:true,
                initializer:JSON.stringify(type),
            },
            {
                name:"_",
                initializer:"{}",
                scope:Scope.Private,
                type:w=>{
                    w.write("Partial<")
                    Writers.object(_.fromPairs(props.map(v=>v.prop)))(w)
                    w.write(">")
                }
            }
        ],
        methods:props.map((v)=>v.method),
        docs:[
            {
                description:`[documentation](${def.doc})`
            }
        ],
    })
    src.saveSync()
}
export function generateAdvField(basePath:string,def:PropertyDef){
    const src=project.createSourceFile(`${basePath}/${_.camelCase(def.identifier)}.ts`,"",{overwrite:true})
    const props=Object.entries(def.properties).map(([name,def])=>generateProperty(name,def))
    src.addClass({
        name:def.identifier,
        extends:"AdvField",
        isExported:true,
        properties:[
            {
                name:"[resourceIdentifier]",
                isReadonly:true,
                initializer:JSON.stringify(def.identifier)
            },
            {
                name:"_",
                initializer:"{}",
                scope:Scope.Private,
                type:w=>{
                    w.write("Partial<")
                    Writers.object({

                    })(w)
                    w.write(">")
                }
            }
        ],
        methods:props.map((v)=>v.method),
        docs:[
            {
                description:`[documentation](${def.doc})`
            }
        ],
    })
    src.saveSync()
}
