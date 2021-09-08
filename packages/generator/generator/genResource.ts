import { project, ResourceDef, PropertyDef } from "."
import { generateProperty } from "./genProperty"
import _ from "lodash/fp"
import { Scope, Writers, ImportDeclarationStructure, OptionalKind } from "ts-morph"

const baseImports:OptionalKind<ImportDeclarationStructure>[]=[
    {moduleSpecifier:"aws-cf-builder-core/field",namedImports:["Field"]},
    {moduleSpecifier:"aws-cf-builder-core/symbols",namedImports:["checkValid", "stacktrace", "checkCache", "generateObject", "resourceIdentifier","prepareQueue"]},
    {moduleSpecifier:"aws-cf-builder-core/general",namedImports:["SMap","ResourceError"]},
    {moduleSpecifier:"aws-cf-builder-core/util",namedImports:["prepareQueueBase","callOnCheckValid","callOnPrepareQueue"]},
    {moduleSpecifier:"aws-cf-builder-core/stackBackend",namedImports:["stackPreparable"]},
    {moduleSpecifier:"aws-cf-builder-core/path",namedImports:["pathItem"]},
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
    src.addImportDeclarations([
        {moduleSpecifier:"aws-cf-builder-core/generatables/resource",namedImports:["Resource"]}
    ])
    resolveDocs(def.doc)
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
        methods:[
            ...props.map((v)=>v.method),
            {
                name:"[checkValid]",
                statements:[
                    "if(this[checkCache]) return this[checkCache]",
                    "const out:SMap<ResourceError>=this[checkCache]={}",
                    "const errors:string[]=[]",
                    w=>w.write("if(errors.length)").block(()=>{
                        w.write("out[this[stacktrace]]="); Writers.object({
                            type:"this[resourceIdentifier]",
                            errors:null
                        })(w)
                    }),
                    "return this[checkCache]=callOnCheckValid(this._, out)"
                ]
            },
            {
                name:"[prepareQueue]",
                parameters:[
                    {name:"stack",type:"stackPreparable"},
                    {name:"path",type:"pathItem"},
                    {name:"ref",type:"boolean"},
                ],
                statements:[
                    w=>w.write("if(prepareQueueBase(stack,path,ref,this))").block(()=>w
                        .writeLine("callOnPrepareQueue(this._,stack,this,true)"))
                ]
            },
            {
                name:"[generateObject]",
                statements:[
                    Writers.returnStatement(Writers.object({
                        Type:"this[resourceIdentifier]",
                        Properties: Writers.object(_.fromPairs(props.map(v=>v.out)))
                    }))
                ]
            }
        ],
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
    src.addImportDeclarations(baseImports)
    src.addImportDeclarations([
        {moduleSpecifier:"aws-cf-builder-core/field",namedImports:["InlineAdvField"]}
    ])
    src.addClass({
        name:def.identifier,
        extends:"InlineAdvField<any>",
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
