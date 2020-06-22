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
/**
 * converts JS object to Substitution json string with parameters
 */
export class JSONField extends Substitution{//todo handle nested jsonFields
    [resourceIdentifier]="JSON"
    private nestedness=0
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
        const This=this
        let text=JSON.stringify(this.object,function(key,value){
            let field=this[key]
            if(field instanceof localField){
                field=field[s_local_val]
            }
            if(field instanceof localField || field instanceof AttributeField || field instanceof ReferenceField || field instanceof Parameter || field instanceof Substitution){
                if(field instanceof JSONField){
                    field=Object.create(field) as JSONField
                    field.nestedness=This.nestedness+1
                }
                const id="repl_"+String(Math.random()*10**10).slice(0,10)
                repl.set(id,field)
                return {[id]:id}
            }else{
                return value
            }
        })
        let tokenTemplate='{"id":"id"}'
        let quote='"'
        for(let i=0;i<this.nestedness;i++){
            text=this.escape(text)
            tokenTemplate=this.escape(tokenTemplate)
            quote=this.escape(quote)
        }
        const segments:string[]=[]
        let lastIndex=0
        repl.forEach((repl,id)=>{
            const replacementToken=tokenTemplate.replace(/id/g,id)
            const newIndex=text.indexOf(replacementToken)
            segments.push(quote+text.slice(lastIndex,newIndex)+quote)
            lastIndex=newIndex+replacementToken.length
        })
        segments.push(quote+text.slice(lastIndex))
        segments[0]=segments[0].slice(quote.length)
        return this.generateSubstitutionOutput(segments,[...repl.values()])
    }
    private escape(text:string){
        return text.replace(/[\b\f\n\r\t\"\\]/g,s=>{
            switch(s){
                case "\b":return "\\b"
                case "\f":return "\\f"
                case "\n":return "\\n"
                case "\r":return "\\r"
                case "\t":return "\\t"
                case "\"":return "\\\""
                case "\\":return "\\\\"
            }
        })
    }
}