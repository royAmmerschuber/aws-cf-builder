import fs from "fs"
import _ from "lodash"
import { generateProvider } from "./generateProvider"
import { importJson, resrej } from "./util"

const basepath="./baseData"
const outpath="./distJs"
const configPath="./config"

Promise.all([ 
    new Promise<string[]>((res,rej)=>fs.readdir(basepath+"/resources",resrej(res,rej))),
    new Promise<string[]>((res,rej)=>fs.readdir(basepath+"/datasources",resrej(res,rej)))
]).then(async (v)=>{
    const resourceNames=v[0].map(v=>v.slice(0,-5))
    const datasourceNames=v[1].map(v=>v.slice(0,-5))
    const hierarchy=generateHierarchy(resourceNames,datasourceNames)
    
    //provider
    const providerSource=await importJson(basepath+"/provider.json")
    const providerConfig=await importJson(configPath+"/provider.json")
    await new Promise<void>((rs,rj)=>fs.writeFile(
        outpath+"/"+hierarchy.providerName+".ts",
        generateProvider(providerSource,providerConfig,hierarchy.providerName),
        resrej(rs,rj)
    ))
},(err)=>console.log(err))

function generateHierarchy(resources:string[],datasources:string[]){
    let providerName="";
    if(resources.length){
        providerName=resources[0].split("_")[0]
    }else if(datasources.length){
        providerName=datasources[0].split("_")[0]
    }
    resources=resources.sort()
    datasources=datasources.sort()
    const r:{[k:string]:string[]}={}
    const d:{[k:string]:string[]}={}
    resources.forEach(v=>{
        const s=v.split("_")
        if(!(s[1] in r)){
            r[s[1]]=[];
        }
        r[s[1]].push(s.slice(2).join("_"))
    })
    datasources.forEach(v => {
        const s=v.split("_")
        if(d[s[1]]==undefined){
            d[s[1]]=[]
        }
        d[s[1]].push(s.slice(2).join("_"))
    })
    type hierarchymap={[k:string]:{[k:string]:string}}
    const outR:hierarchymap={}
    const outD:hierarchymap={}
    for(const k in r){
        const v=r[k]
        const comp=v[0].split("_")
        let len=comp.length
        const getMaxLength=(v:string)=>{
            _.forEach(v.split("_"),(v,i)=>{
                if(i>=len || v!=comp[i]){
                    len=i
                    return false
                }
            })
        }
        if(v.length>1){
            v.slice(1).forEach(getMaxLength)
        }
        if(k in d){
            d[k].forEach(getMaxLength)
        }

        const prefix=comp.slice(0,len).join("_")
        let newKey=k
        if (prefix!=""){
            newKey+="_"+prefix
        }
        const fillItem=v=>{
            let name=v.slice(prefix.length && prefix.length+1)
            let identifier=providerName+"_"+newKey
            if(name){
                identifier+="_"+name
            }else{
                name=newKey
            }
            items[name]=identifier
        }
        let items={}
        v.forEach(fillItem)
        outR[newKey]=items

        if(k in d){
            d[k].forEach(fillItem)
        }
        outD[newKey]=items
    }
    for(const k in d){
        if(!(k in r)){
            const v=d[k]
            const comp=v[0].split("_")
            let len=comp.length
            if(v.length>1){
                v.slice(1).forEach(v=>{
                    _.forEach(v.split("_"),(v,i)=>{
                        if(i>=len || v!=comp[i]){
                            len=i
                            return false
                        }
                    })
                })
            }
            const prefix=comp.slice(0,len).join("_")
            let newKey=k
            if (prefix!=""){
                newKey+="_"+prefix
            }
            let items={}
            v.forEach(v=>{
                let name=v.slice(prefix.length+1)
                let identifier=providerName+"_"+newKey
                if(name){
                    identifier+="_"+name
                }else{
                    name=newKey
                }
                items[name]=identifier
            })
            outD[newKey]=items
        }
    }
    return {resources:outR,datasources:outD,providerName:providerName}
}

