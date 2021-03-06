import { SMap, ResourceError, Preparable } from "../general";
import { Field, InlineAdvField, isAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, toJson } from "../symbols";
import { stackPreparable } from "../stackBackend";
import _ from "lodash/fp"
import { AttributeField } from "./attributeField";
import { ReferenceField } from "./referenceField";
import { pathItem } from "../path";
import { Parameter } from "../generatables/parameter"
import { Resource } from "../generatables/resource";
import { localField, s_local_val } from "./local";
import { callOnPrepareQueue, callOnCheckValid } from "../util";
export function Sub(text:string,subs:SMap<Field<any>>):Substitution
export function Sub(text:readonly string[],...args:Field<any>[]):Substitution
export function Sub(text:readonly string[]|string,...args:Field<any>[]){
    return new Substitution(1,text,args)
}
export class Substitution extends InlineAdvField<string>{
    [resourceIdentifier]="Fn::Sub"
    constructor(
        depth:number,
        protected readonly text:readonly string[] | string,
        protected readonly args:Field<any>[]
    ){ super(depth) }
    protected generateSubstitutionOutputApi(text:string,subs:SMap<any>){
        const reg=/((?:[^$]|\$(?!{))*)\${([^!][^}]*)}/g
        
        let outS=""
        const outO={}
        let simple=true
        let lastIndex=0
        let m:RegExpExecArray
        for(let i=0;m=reg.exec(text);i++){
            outS+=m[1]
            let val=subs[m[2]]
            if(val instanceof localField){
                val=val[s_local_val]
            }
            if(typeof val=="string" || typeof val=="number"){
                outS+=val
            }else{
                const tag=this.generateTag(val)
                if(tag){
                    outS+=tag
                    simple=false
                }else{
                    if(isAdvField(val)){
                        const out=val[toJson]()
                        switch(typeof out){
                            case "number":
                            case "boolean":
                            case "string":{
                                outS+=out
                                break
                            }
                            default:{
                                outS+=`\${${m[2]}}`
                                outO[m[2]]=out
                                simple=false
                                break;
                            }
                        }
                    }else{
                        outS+=`\${${m[2]}}`
                        outO[m[2]]=val
                        simple=false
                    }
                }
            }
            lastIndex=m.index+m[0].length
        }
        outS+=text.slice(lastIndex)
        if(simple){
            return outS.replace(/\$\{\!/g,"${")
        }else if(_.isEmpty(outO)){
            return { "Fn::Sub":outS}
        }else{
            return { "Fn::Sub":[outS,outO]}
        }
    }
    protected cleanText(text:string){
        return text.replace(/\$\{/g,"${!")
    }
    protected generateSubstitutionOutput(text:readonly string[],args:Field<any>[]){
        text=text.map(this.cleanText)
        let templString=text[0]
        const leftovers=[]
        let simple=true
        args.forEach((v,i) => {
            if(typeof v == "string" || typeof v=="number"){
                templString+=v
            }else{
                const tag=this.generateTag(v)
                if(tag){
                    templString+=tag
                    simple=false
                }else{
                    if(isAdvField(v)){
                        const out=v[toJson]()
                        switch(typeof out){
                            case "number":
                            case "boolean":
                            case "string":{
                                templString+=out
                                break
                            }
                            default:{
                                leftovers.push(v)
                                templString+=`\${par_${leftovers.length}}`
                                simple=false
                                break;
                            }
                        }
                    }else{
                        leftovers.push(v)
                        templString+=`\${par_${leftovers.length}}`
                        simple=false
                    }
                }
            }
            templString+=text[i+1]
        })
        if(simple){
            return templString.replace(/\$\{\!/g,"${")
        }else if(leftovers.length){
            return { "Fn::Sub":[templString,_.fromPairs(leftovers.map((v,i)=>["par_"+(i+1),v])) as SMap<any>]}
        }else{
            return { "Fn::Sub":templString}
        }
    }
    private generateTag(val:any):string|void{
        if(isAdvField(val)){
            if(val instanceof Substitution){
                const subs=val[toJson]()
                if(typeof subs=="string"){
                    return subs
                }else if(typeof subs["Fn::Sub"]=="string"){
                    return subs["Fn::Sub"]
                }else {
                    return null
                }
            }else if(val instanceof AttributeField){
                const getAtt=val[toJson]()["Fn::GetAtt"]
                return `\${${getAtt[0]}.${getAtt[1]}}`
            }else if(val instanceof ReferenceField || val instanceof Parameter){
                const ref=val[toJson]().Ref
                return `\${${ref}}`
            }
        }else if(val instanceof Resource){
            const ref=val.r[toJson]().Ref
            return `\${${ref}}`
        }
        return null
    }
    [toJson](){
        if(typeof this.text=="string") return this.generateSubstitutionOutputApi(this.text,this.args[0])
        else return this.generateSubstitutionOutput(this.text,this.args)
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOnCheckValid(this.args,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this.args,stack,path,true)
    }
}
