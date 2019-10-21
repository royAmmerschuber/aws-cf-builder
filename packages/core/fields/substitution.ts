import { SMap, ResourceError, pathItem } from "../general";
import { Field, InlineAdvField, isAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue } from "../symbols";
import { stackPreparable } from "../stackBackend";
import _ from "lodash/fp"
import { AttributeField } from "./attributeField";
import { ReferenceField } from "./referenceField";
export function Sub(text:TemplateStringsArray,...args:Field<any>[]){
    return new Substitution(text,args)
}
export class Substitution extends InlineAdvField<string>{
    [resourceIdentifier]="Fn:Sub"
    constructor(
        private text:TemplateStringsArray,
        private args:Field<any>[]
    ){ super(1) }

    toJSON(){
        let templString=this.text[0]
        const leftovers=[]

        this.args.forEach((v,i) => {
            if(isAdvField(v)){
                if(v instanceof AttributeField){
                    const getAtt=v.toJSON()["Fn::GetAtt"]
                    templString+=`\${${getAtt[0]}.${getAtt[1]}}`
                }else if(v instanceof ReferenceField){
                    const ref=v.toJSON().Ref
                    templString+=`\${${ref}}`
                }else{
                    leftovers.push(v)
                    templString+=`\${par_${leftovers.length}}`
                }
            }else if(typeof v == "string" || typeof v=="number"){
                templString+=v
            }else{
                leftovers.push(v)
                templString+=`\${par_${leftovers.length}}`
            }
            templString+=this.text[i+1]
        })
        if(leftovers.length){
            return { "Fn::Sub":[templString,_.fromPairs(leftovers.map((v,i)=>["par_"+(i+1),v]))]}
        }else{
            return { "Fn::Sub":templString}
        }
    }
    [checkValid](): SMap<ResourceError> {
        return this.args.reduce((o,c)=>{
            if(isAdvField(c)){
                return _.assign(o,c[checkValid]())
            }
            return o
        },{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        this.args.forEach(v => {
            if(isAdvField(v)){
                v[prepareQueue](stack,path,true)
            }
        })
    }
}