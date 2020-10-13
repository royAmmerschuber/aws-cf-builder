import { transform, TransformOptions } from "./../index"
import fs from "fs"
import path from "path"
import strip from "strip-ansi"
[
    "core",
    "resources"
].forEach(area => handleHead(area, fs.readdirSync(path.join(__dirname, area))))
const options = {
    typescript: true,
    check:true,
    returnObject:true
}
function handleHead(area: string, folders: string[]) {
    describe(area,()=>{
        folders.forEach(folder => {
            const files = fs.readdirSync(path.join(__dirname, area, folder))
                .sort()
            describe(folder, () => {
                files.forEach((respName, i) => {
                    const inpName = respName.slice(0, respName.lastIndexOf(".cf")) + ".cf.ts"
                    if (respName.endsWith(".cf.json") && files.includes(inpName, i + 1)) {
                        testFile(inpName, path.join(__dirname, area, folder, inpName), require(`./${area}/${folder}/${respName}`))
                    } else if (respName.endsWith(".cf.error.json") && files.includes(inpName, i + 1)) {
                        testError(inpName,path.join(__dirname,area,folder,inpName), require(`./${area}/${folder}/${respName}`))
                    }
                })
            })
        })
    })
}
function testFile(name: string, path: string, comparison: any) {
    test(name, () => {
        const resp = transform(path, options)
        expect(resp).toEqual(comparison)
    })
}
type comp=[string,string[]]
function testError(name:string,path:string,comp:comp[]){
    test(name,()=>{
        const exp:comp[]=comp.map(([type,errs])=>[type,errs.sort()])
        let threw:Error
        try{
            transform(path,options)
        }catch(e){
            threw=e
        }
        expect(threw).not.toBeUndefined()
        const recv:comp[]=threw.message.trimRight().split("\n\n")
            .map(v=>v.split("\n"))
            .map(([,type,...errs])=>[strip(type),errs.map(strip).sort()])
        expect(recv).toEqual(exp)
    })
}