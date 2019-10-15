import * as test from "../testFiles/test"
import { ModuleBackend } from "../general/moduleBackend"
import { ResourceError, SMap } from "../general/general"
import _ from "lodash/fp"
import chalk from "chalk"
x()
function x(){
    const x=new ModuleBackend(test)
    printErrors(x.checkValid())
    const modules:Set<ModuleBackend>=new Set()
    x.prepareQueue(modules)
    modules.forEach(v => {
        console.log(JSON.stringify(v.generateObject(),null,4))
    })
}
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