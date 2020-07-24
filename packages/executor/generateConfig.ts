import path from "path"
import template from "./cf.tsconfig.json"
import slash from "slash"
import chalk from "chalk"
export async function generateConfig(dirPath:string){
    let nodePath:string
    try{
        nodePath=path.join(require.resolve("@types/node/package.json"),"../..")
    }catch(e){
        console.log(__dirname)
        console.log(e)
        console.error(chalk`{redBright node types not found.}\nyou may want to install them with '{yellowBright npm i @types/node}' and rerun this command`)
    }
    const newTypes=[
        `${__dirname}/types`,
        nodePath
    ].filter(Boolean)
    template.compilerOptions.typeRoots=newTypes
        .map(p=>path.relative(dirPath,p))
        .map(p=>slash(p))
    return JSON.stringify(template,undefined,4)
}