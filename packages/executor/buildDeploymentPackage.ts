import { exec } from "child_process"
import util from "util"
import { promises as fs} from "fs"

const execP = util.promisify(exec)
execP('npm run buildCore').then(async ({ stdout }) => {
    console.log(stdout)
    ;({ stdout } = await execP('npm run buildPreDef'))
    console.log(stdout)
    ;({ stdout } = await execP('npm run build'))
    console.log(stdout)

    const pkg=JSON.parse((await fs.readFile("./dist/package.json")).toString())
    pkg.dependencies["aws-cf-builder-core"]="file:../../core/dist",
    pkg.dependencies["aws-cf-builder-defined-resources"]="file:../../cf-definedResources/dist"
    await fs.writeFile("./dist/package.json",JSON.stringify(pkg))

    ;({ stdout } = await execP('npm i',{cwd:"./dist"}))
    console.log(stdout)

    delete pkg.dependencies["aws-cf-builder-core"]
    delete pkg.dependencies["aws-cf-builder-defined-resources"]
    await fs.writeFile("./dist/package.json",JSON.stringify(pkg))

    ;({ stdout } = await execP('npm pack ./dist'))
    console.log(stdout)
})