import * as path from "path"
import * as fs from "fs"

import * as commander from "commander"

import { SMap } from "aws-cf-builder-core/general"
import { StackBackend } from "aws-cf-builder-core/stackBackend"
import { ResourceError } from "aws-cf-builder-core/general"
import chalk from "chalk"
import * as _ from "lodash/fp"
import * as ts from "ts-node"
let yaml:typeof import("js-yaml")
function printErrors(errs:SMap<ResourceError>){
    _.flow(
        _.toPairs,
        _.forEach((v:[string,ResourceError])=>{
            console.log(v[0]+"\n"+
                chalk.yellow(v[1].type)+"\n"+
                v[1].errors.join("\n")
            )
        })
    )(errs)
}

const program:commander.Command & {
    typescript:boolean,
    output:string,
    check:boolean,
    indent:boolean,
    yaml:boolean
}=new commander.Command()
    .version("0.0.1")
    .arguments('<file>')

    .option('-o, --output <folder>',"the folder to output to")

    .option('-t, --typescript',"transpile Typescript files")
    .option('-c, --check',"check the typescript for type errors")
    .option('-y, --yaml','use yaml as output language') //TODO make yaml implementation less retarded
    .option('--no-indent',"doesnt indent json output")
    .parse(process.argv) as any

let err=false
if(program.typescript){
    try{
        const opt:ts.Options={
            compilerOptions:{
                typeRoots:[
                    path.join(__dirname,"../types")
                ],
            },
            transpileOnly:!program.check
        }
        require("ts-node").register(opt)
    }catch(ex){
        console.log(chalk`{red install ts-node if you want to use the {redBright --typescript flag}}`)
        err=true
    }
}else if(program.check){
    console.log(chalk`{red if you specify {redBright --check} then you also need to specify {redBright --typescript}}`)
}
if(program.yaml){
    yaml=require("js-yaml")
}
if(!program.args[0]){
    console.log(chalk.red("please specify the file to compile"))
    program.outputHelp()
    err=true
}
if(err){
    process.exit(1)
}
require("../globals")

const inPath=path.resolve(program.args[0]);
const mainModule=new StackBackend(require(inPath))
const errors=mainModule.checkValid()
if(_.size(errors)>0){
    printErrors(errors)
    process.exit(1)
}
const modules=new Set<StackBackend>()
try{
    mainModule.prepareQueue(modules)
    const moduleName=path.parse(inPath).name
    let output:string,ending:string
    output=JSON.stringify(mainModule.generateObject(),null,program.indent ? 4 : 0)
    if(program.yaml){
        output=yaml.safeDump(JSON.parse(output))
        ending=".yaml"
    }else{
        ending=".json"
    }
    if(!moduleName.endsWith(".cf")){
        ending=".cf"+ending
    }
    if(program.output){
        const outPath=path.resolve(program.output)
        fs.mkdir(outPath,{recursive:true},err => {
            if(err){
                console.log("couldnt create folder")
                process.exit(1)
            }
            fs.writeFile(path.join(outPath,moduleName+ending),output,err=>{
                if(err){
                    console.log("couldnt create file")
                    process.exit(1)
                }
                console.log(chalk.yellowBright("Created:"))
                console.log(path.join(program.output,chalk.green(moduleName+ending)))
                process.exit(0)
            })
        })
    }else{
        console.log(output)
    }
}catch(ex){
    console.log(ex)
}