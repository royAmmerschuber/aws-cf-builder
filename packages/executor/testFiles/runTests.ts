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
function testError(name:string,path:string,comp:any[]){
    test(name,()=>{
        const comps=comp.map(([type,errs]:[string,string[]])=>({type,errs}))
        let threw:Error
        try{
            transform(path,options)
        }catch(e){
            threw=e
        }
        expect(threw).not.toBeUndefined()
        const errors=threw.message.trimRight().split("\n\n")
        expect(errors.length).toBe(comp.length)
        comps.forEach((c,i)=>{
            const [,type,...errs]=errors[i].split("\n")
            expect(strip(type)).toBe(c.type)
            expect(errs.length).toBe(c.errs.length)
            c.errs.forEach(err=>{
                expect(errs).toContain(err)
            })
        })
    })
}