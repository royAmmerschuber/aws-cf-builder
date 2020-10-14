#!/usr/bin/env node
import * as path from "path"
import {promises as fs} from "fs"

import * as commander from "commander"

import chalk from "chalk"
import * as _ from "lodash/fp"
import { transform, TransformOptions } from ".."
import { generateConfig } from "../generateConfig"
const program:commander.Command & TransformOptions & {
    generateTsconfig?:boolean
} =new commander.Command()
    .version("0.0.1")
    .arguments('<file>')

    .option('-o, --output <folder>',"the folder to output to")
    .option('-t, --typescript',"transpile Typescript files")
    .option('-c, --check',"check the typescript for type errors")
    .option('-y, --yaml','use yaml as output language') //TODO make yaml implementation less retarded
    .option('    --no-indent',"doesnt indent json output")
    .option('    --sam','apply the sam transformation, shorthand for `--transform "AWS::Serverless-2016-10-31"`')
    .option('    --transform <transform>',"the transform to apply")
    .option('    --generate-tsconfig', "generates a tsconfig for folder <file>")
    .parse(process.argv) as any

if(program.args.length>1){
    console.log(chalk.red("too many arguments"))
    program.outputHelp()
    process.exit(1)
}
if(program.generateTsconfig){
    const inPath=program.args[0] 
        ? path.resolve(program.args[0])
        : process.cwd()
    
    generateConfig(inPath).then(async configContent=>{
        await writeFile(inPath,"tsconfig.json",configContent)
        console.log(chalk.yellowBright("Created:"))
        console.log(path.join(program.args[0] || ".",chalk.green("tsconfig.json")))
        process.exit(0)
    })
}else{
    if(!program.args[0]){
        console.log(chalk.red("please specify the file to compile"))
        program.outputHelp()
        process.exit(1)
    }
    const inPath=path.resolve(program.args[0]);
    let outputString:string
    try{
        outputString=transform(inPath,program)
    }catch(e){
        if(e instanceof Error){
            console.log(e.message)
        }else{
            console.log(e)
        }
        process.exit(1)
    }
    let ending:string
    const moduleName=path.parse(inPath).name
    if(program.yaml){
        ending=".yaml"
    }else{
        ending=".json"
    }
    if(!moduleName.endsWith(".cf")){
        ending=".cf"+ending
    }
    if(program.output){
        const outPath=path.resolve(program.output)
        writeFile(outPath,moduleName+ending,outputString).then(()=>{
            console.log(chalk.yellowBright("Created:"))
            console.log(path.join(program.output,chalk.green(moduleName+ending)))
            process.exit(0)
        })
    }else{
        console.log(outputString)
    }
}
async function writeFile(basepath: string,name: string,content: string | Uint8Array){
    await fs.mkdir(basepath,{recursive:true})
        .catch(err=>{
            console.error(chalk.red`couldnt create folder`)
            process.exit(1)
        })
    await fs.writeFile(path.join(basepath,name),content)
        .catch(err=>{
            console.error(chalk.red`couldnt create file`)
            process.exit(1)
        })
}