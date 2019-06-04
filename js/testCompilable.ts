import fs from "fs"
import path from "path"
const read=(filePath:string,isDir:boolean)=>{
    if (isDir){
        fs.readdirSync(filePath,{withFileTypes:true}).forEach(v=>{
            read(path.join(filePath,v.name),v.isDirectory())
        })
    }else{
        try{
            require(filePath)
        }catch(e){
            console.log("failed:"+filePath)
        }
    }
    
}
read("../dist",true)