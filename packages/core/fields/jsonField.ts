import { stackPreparable } from "../stackBackend";
import { checkValid, prepareQueue, resourceIdentifier } from "../symbols";
import { pathItem } from "../path";
import { callOn } from "../util";
import { Preparable } from "../general";
import _ from "lodash/fp"
import { AttributeField } from "./attributeField";
import { ReferenceField } from "./referenceField";
import { Substitution } from "./substitution";
import { Parameter } from "../generatables/parameter";
import { localField, s_local_val } from "./local";
export class JSONField extends Substitution{
    [Symbol.toStringTag]: string;
    [resourceIdentifier]="JSON"
    constructor(private object:any){super(2,[],[])}
    [checkValid](){
        return callOn(this.object,Preparable,o=>o[checkValid]())
            .reduce(_.assign,{})
    }
    [prepareQueue](stack:stackPreparable, path:pathItem, ref: boolean){
        callOn(this.object,Preparable,o=>o[prepareQueue](stack,path,true))
    }
    toJSON() {
        const repl=new Map<string,AttributeField|ReferenceField|Substitution|Parameter<any>>()
        let text=JSON.stringify(this.object,function(key,value){
            const field=this[key]
            if(field instanceof localField || field instanceof AttributeField || field instanceof ReferenceField || field instanceof Parameter || field instanceof Substitution){
                const id="repl_"+String(Math.random()*10**10).slice(0,10)
                if(field instanceof localField){
                    repl.set(id,field[s_local_val])
                }else{
                    repl.set(id,field)
                }
                return {[id]:id}
            }else{
                return value
            }
        })
        const segments:string[]=[]
        let lastIndex=0
        repl.forEach((repl,id)=>{
            const replacementToken=`{"${id}":"${id}"}`
            const newIndex=text.indexOf(replacementToken)
            segments.push('"'+text.slice(lastIndex,newIndex)+'"')
            lastIndex=newIndex+replacementToken.length
        })
        segments.push('"'+text.slice(lastIndex))
        segments[0]=segments[0].slice(1)
        return this.generateSubstitutionOutput(segments,[...repl.values()])
    }
}