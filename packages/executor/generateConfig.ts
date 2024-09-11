import path from "path"
import template from "./cf.tsconfig.json"
import slash from "slash"

export async function generateConfig(dirPath:string){
    const newTypes=[
        `${__dirname}/types`
    ]
    template.compilerOptions.typeRoots=newTypes
        .map(p=>path.relative(dirPath,p))
        .map(p=>slash(p))
    return JSON.stringify(template,undefined,4)
}
