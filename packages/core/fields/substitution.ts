import { SMap, ResourceError, Preparable } from "../general";
import { Field, InlineAdvField, isAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache } from "../symbols";
import { stackPreparable } from "../stackBackend";
import _ from "lodash/fp"
import { AttributeField } from "./attributeField";
import { ReferenceField } from "./referenceField";
import { pathItem } from "../path";
import { Parameter } from "../generatables/parameter"
import { Resource } from "../generatables/resource";
import { localField, s_local_val } from "./local";
import { callOn } from "../util";
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
        const reg=/((?:[^$]|\$(?!{))*)\${([^}]+)}/g
        
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
                }else{
                    outS+=`\${${m[2]}}`
                    outO[m[2]]=val
                }
                simple=false
            }
            lastIndex=m.index+m[0].length
        }
        outS+=text.slice(lastIndex)
        if(simple){
            return outS
        }else if(_.isEmpty(outO)){
            return { "Fn::Sub":outS}
        }else{
            return { "Fn::Sub":[outS,outO]}
        }
    }
    protected generateSubstitutionOutput(text:readonly string[],args:Field<any>[]){
        text=text.map(t=>t.replace(/\$\{/g,"${!"))
        let templString=text[0]
        const leftovers=[]
        let simple=true
        args.forEach((v,i) => {
            if(typeof v == "string" || typeof v=="number"){
                templString+=v
            }else{
                simple=false
                const tag=this.generateTag(v)
                if(tag){
                    templString+=tag
                }else{
                    leftovers.push(v)
                    templString+=`\${par_${leftovers.length}}`
                }
            }
            templString+=text[i+1]
        })
        if(simple){
            return templString
        }else if(leftovers.length){
            return { "Fn::Sub":[templString,_.fromPairs(leftovers.map((v,i)=>["par_"+(i+1),v])) as SMap<any>]}
        }else{
            return { "Fn::Sub":templString}
        }
    }
    private generateTag(val:any):string|void{
        if(isAdvField(val)){
            if(val instanceof AttributeField){
                const getAtt=val.toJSON()["Fn::GetAtt"]
                return `\${${getAtt[0]}.${getAtt[1]}}`
            }else if(val instanceof ReferenceField || val instanceof Parameter){
                const ref=val.toJSON().Ref
                return `\${${ref}}`
            }
        }else if(val instanceof Resource){
            const ref=val.r.toJSON().Ref
            return `\${${ref}}`
        }
        return null
    }
    toJSON(){
        if(typeof this.text=="string") return this.generateSubstitutionOutputApi(this.text,this.args[0])
        else return this.generateSubstitutionOutput(this.text,this.args)
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOn(this.args,Preparable,o=>o[checkValid]())
            .reduce(_.assign,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOn(this.args,Preparable,o=> o[prepareQueue](stack,path,true))
    }
}
