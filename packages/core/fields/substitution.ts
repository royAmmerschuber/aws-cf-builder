import { SMap, ResourceError } from "../general";
import { Field, InlineAdvField, isAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue } from "../symbols";
import { stackPreparable } from "../stackBackend";
import _ from "lodash/fp"
import { AttributeField } from "./attributeField";
import { ReferenceField } from "./referenceField";
import { pathItem } from "../path";
import { Parameter } from "../generatables/parameter"
export function Sub(text:readonly string[],...args:Field<any>[]){
    return new Substitution(1,text,args)
}
export class Substitution extends InlineAdvField<string>{
    [resourceIdentifier]="Fn::Sub"
    constructor(
        depth:number,
        protected readonly text:readonly string[],
        protected readonly args:Field<any>[]
    ){ super(depth) }
    //TODO escape plaintext ${}
    protected generateSubstitutionOutput(text:readonly string[],args:Field<any>[]){
        let templString=text[0]
        const leftovers=[]
        let pureString=true
        args.forEach((v,i) => {
            if(isAdvField(v)){
                pureString=false
                if(v instanceof AttributeField){
                    const getAtt=v.toJSON()["Fn::GetAtt"]
                    templString+=`\${${getAtt[0]}.${getAtt[1]}}`
                }else if(v instanceof ReferenceField || v instanceof Parameter){
                    const ref=v.toJSON().Ref
                    templString+=`\${${ref}}`
                }else{
                    leftovers.push(v)
                    templString+=`\${par_${leftovers.length}}`
                }
            }else if(typeof v == "string" || typeof v=="number"){
                templString+=v
            }else{
                pureString=false
                leftovers.push(v)
                templString+=`\${par_${leftovers.length}}`
            }
            templString+=text[i+1]
        })
        if(pureString){
            return templString
        }else if(leftovers.length){
            return { "Fn::Sub":[templString,_.fromPairs(leftovers.map((v,i)=>["par_"+(i+1),v])) as SMap<any>]}
        }else{
            return { "Fn::Sub":templString}
        }
    }
    toJSON(){
        return this.generateSubstitutionOutput(this.text,this.args)
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
