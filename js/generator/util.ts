import fs from "fs"
import _ from "lodash"
export function redent(newDepth:number,s:string){
    s=s.slice(1)
    const trimlength=s.length-s.trimLeft().length
    s=s.replace(new RegExp(`^ {${trimlength}}`,"gm"),_.repeat(" ",newDepth))
    return s.slice(0,s.lastIndexOf("\n")+1)
}
export function importJson(path:string){
    return new Promise<string>(
        (rs,rj)=>fs.readFile(path,"utf-8",resrej(rs,rj))
    )
        .then(v => JSON.parse(v))
}
export function resrej<T,U>(res:(v:T)=>void,rej:(err:U)=>void){
    return (err:U,v?:T)=>{
        if(err){
            rej(err)
        }else{
            res(v)
        }
    }
}
export const pascalcase:(s:string)=>string=_.flow(_.camelCase,_.upperFirst)