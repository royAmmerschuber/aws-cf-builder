import _ from "lodash/fp"
import { config } from "./config"
import chalk from "chalk"
const stack= require("callsite") as ()=>NodeJS.CallSite[]
export function getShortStack(errorDepth:number){
    return _.flow(
        _.filter<NodeJS.CallSite>(v=>config.errorBlacklist.every(c => v.getFileName() && v.getFileName().search(c)==-1)),
        _.drop(1+errorDepth),
        _.map(v => {
            const pathMatch=v.getFileName().match(new RegExp("(?:[\\\\\\/][^\\\\\\/]*){1,"+config.errorPathLength+"}$"))
            return {
                func:v.getFunctionName() ? v.getFunctionName() : "Object.<anonymous>",
                file:pathMatch && "..."+pathMatch[0],
                line:v.getLineNumber(),
                col:v.getColumnNumber()
            }
        }),
        _.map(v => chalk.red(v.func)+chalk.bold.redBright(" ("+v.file+":"+v.line+":"+v.col+")")),
        _.join(";")
    )(stack())
}