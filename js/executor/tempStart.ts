import * as test from "../testFiles/test"
import { ModuleBackend } from "../general/moduleBackend"
const x=new ModuleBackend(test)
const y=new ModuleBackend(test)
console.log(x===y)
x.checkValid()
const modules:Set<ModuleBackend>=new Set()
x.prepareQueue(modules)
modules.forEach(v => {
    console.log(v.generateObject())
})
