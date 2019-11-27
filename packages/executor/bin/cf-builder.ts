import * as path from "path"
import * as fs from "fs"

import * as commander from "commander"

import chalk from "chalk"
import * as _ from "lodash/fp"
import { transform } from ".."

const program:commander.Command & {
    typescript:boolean,
    output:string,
    check:boolean,
    indent:boolean,
    yaml:boolean,
    sam:boolean,
    transform:string
}=new commander.Command()
    .version("0.0.1")
    .arguments('<file>')

    .option('-o, --output <folder>',"the folder to output to")

    .option('-t, --typescript',"transpile Typescript files")
    .option('-c, --check',"check the typescript for type errors")
    .option('-y, --yaml','use yaml as output language') //TODO make yaml implementation less retarded
    .option('--no-indent',"doesnt indent json output")
    .option('--sam','apply the sam transformation, shorthand for `--transform "AWS::Serverless-2016-10-31"`')
    .option('--transform <transform>',"the transform to apply")
    .parse(process.argv) as any

if(!program.args[0]){
    console.log(chalk.red("please specify the file to compile"))
    program.outputHelp()
    process.exit(1)
}

require("../globals")

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
try{
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
        fs.mkdir(outPath,{recursive:true},err => {
            if(err){
                console.log("couldnt create folder")
                process.exit(1)
            }
            fs.writeFile(path.join(outPath,moduleName+ending),outputString,err=>{
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
        console.log(outputString)
    }
}catch(ex){
    console.log(ex)
}