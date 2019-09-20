import fs from "fs"
import _ from "lodash"
import util from "util"
export function redent(newDepth:number,s:string){
    s=s.slice(1)
    const trimlength=s.length-s.trimLeft().length
    s=s.replace(new RegExp(`^ {${trimlength}}`,"gm"),_.repeat(" ",newDepth))
    return s.slice(0,s.lastIndexOf("\n")+1)
}
const promReadFile=util.promisify(fs.readFile)
export function importJson(path:string){
    return promReadFile(path,"utf-8")
        .then(v => JSON.parse(v))
}
export const pascalcase:(s:string)=>string=_.flow(_.camelCase,_.upperFirst)