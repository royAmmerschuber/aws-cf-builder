import _ from "lodash";
import { ProviderBaseData } from "./baseDataDef";
import { ProviderConfig } from "./config";
import { generateAttributes } from "./attribute";
import { redent, pascalcase } from "./util";

export function generateProvider(baseData:ProviderBaseData,config:ProviderConfig,name:string):string{
    const className=pascalcase(name)
    let out=""
    out+=redent(0,`
        import {Field} from "./general/field"
        import {Provider} from "./general/provider"
        import {Module} from "./general/module"
        import { checkValid, ResourceError, SMap, prepareQueue, generateObject, resourceIdentifier } from "./general/general"

    `)
    out+=redent(0,`
        export class ${className} extends Provider{
            protected readonly [resourceIdentifier]="${name}"

    `)
    const attributes=generateAttributes(baseData)
    
    attributes.forEach(v=>{
        out+="    "+v.generateParameter()
    })
    out+=redent(4,`
        [checkValid]():SMap<ResourceError>{
            throw ""
        }

        [prepareQueue](mod:Module,param:any){
            throw ""
        }

        [generateObject](){

        }
    `)
    out+="}"
    return out
}


