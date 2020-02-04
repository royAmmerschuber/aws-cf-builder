import { transform, TransformOptions } from "./../index"
import fs from "fs"
import path from "path"
[
    "core",
    "resources"
].forEach(area => handleHead(area, fs.readdirSync(path.join(__dirname, area))))
const options: TransformOptions = {
    typescript: true,
}
function handleHead(area: string, folders: string[]) {
    folders.forEach(folder => {
        const files = fs.readdirSync(path.join(__dirname, area, folder))
            .sort()
        describe(`${area}/${folder}`, () => {
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
}
function testFile(name: string, path: string, comparison: any) {
    test(name, () => {
        const resp = JSON.parse(transform(path, options))
        expect(resp).toEqual(comparison)
    })
}
function testError(name:string,path:string,comp){
    test(name,()=>{
        expect(()=>transform(path,options)).toThrow(comp.message)
    })
}