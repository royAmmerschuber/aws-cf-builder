import * as test from "../testFiles/test"
import { ModuleBackend } from "../general/moduleBackend"
x()
function x(){
    const x=new ModuleBackend(test)
    x.checkValid()
    const modules:Set<ModuleBackend>=new Set()
    x.prepareQueue(modules)
    modules.forEach(v => {
        console.log(v.generateObject())
    })
}