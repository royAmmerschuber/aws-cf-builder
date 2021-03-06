import { stackPreparable } from "../stackBackend";
import { checkValid, prepareQueue, resourceIdentifier, toJson } from "../symbols";
import { pathItem } from "../path";
import { callOnCheckValid, callOnPrepareQueue } from "../util";
import { Preparable, PreparableError } from "../general";
import _ from "lodash/fp"
import { AttributeField } from "./attributeField";
import { ReferenceField } from "./referenceField";
import { Substitution } from "./substitution";
import { Parameter } from "../generatables/parameter";
import { localField, s_local_val } from "./local";
import { isAdvField, AdvField } from "../field";
import stringify from "json-stable-stringify";

export const s_jsonLiteral=Symbol("s_jsonLiteral")
/**
 * converts JS object to Substitution json string with parameters
 */
export class JSONField extends Substitution{
    readonly [resourceIdentifier]="JSONField"
    private nestedness=0
    constructor(private object:any){super(2,[],[])}
    [checkValid](){
        return callOnCheckValid(this.object,{})
    }
    [prepareQueue](stack:stackPreparable, path:pathItem, ref: boolean){
        callOnPrepareQueue(this.object,stack,path,true)
    }
    [toJson]() {
        const repl=new Map<string,{
            field:AttributeField|ReferenceField|Substitution|Parameter<any>,
            type?:"number"|"string"|"literal"|"boolean"
        }>()
        const This=this
        let text=stringify(this.object,{
            replacer(key,value){
                let field=this[key]
                let type:"number"|"string"|"literal"|"boolean"|undefined
                type=field?.[s_jsonLiteral]
                if(field instanceof localField){
                    field=field[s_local_val]
                    if(!type){
                        type=field?.[s_jsonLiteral]
                    }
                }
                if(field instanceof localField || field instanceof AttributeField || field instanceof ReferenceField || field instanceof Parameter || field instanceof Substitution){
                    if(field instanceof JSONField){
                        if(type=="literal") {
                            throw new PreparableError(This,"cannot insert jsonField as literal into jsonField")
                        }
                        field=Object.create(field) as JSONField
                        field.nestedness=This.nestedness+1
                    }
                    const id="repl_"+String(Math.random()*10**10).slice(0,10)
                    repl.set(id,{
                        field,
                        type
                    })
                    return {[id]:id}
                }else if(isAdvField(field)){
                    return field[toJson]()
                }else{
                    return value
                }
            }
        })
        let tokenTemplate='{"id":"id"}'
        let quote='"'
        for(let i=0;i<this.nestedness;i++){
            text=this.escape(text)
            tokenTemplate=this.escape(tokenTemplate)
            quote=this.escape(quote)
        }
        text=this.cleanText(text)
        const replOut:Record<string,any>={}
        repl.forEach(({type,field},id)=>{
            replOut[id]=field
            const replToken=tokenTemplate.replace(/id/g,id)
            if(type=="literal" && this.nestedness!=0) {
                 throw new PreparableError(this,"you cant specify a literal json type inside of a nested jsonField") 
            }
            const replacement= type=="string"||type==undefined
                ? quote+`\${${id}}`+quote
                : `\${${id}}`
            text=text.replace(replToken,replacement)
        })

        return this.generateSubstitutionOutputApi(text,replOut)
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
    static literal(lit:boolean):boolean;
    static literal(lit:number):number;
    static literal(lit:string):object;
    static literal<T extends AdvField<any>>(lit:T):T & {[s_jsonLiteral]:"literal"}
    static literal<T extends AdvField<any>>(lit:T|boolean|number|string):T & {[s_jsonLiteral]:"literal"}|number|boolean|object{
        switch(typeof lit){
            case "boolean":
            case "number":
            case "string":{
                const out=JSON.parse(lit as string)
                return out
            }
            default:{
                const out:{[s_jsonLiteral]:"literal"}={
                    [s_jsonLiteral]:"literal"
                }
                Object.setPrototypeOf(out,lit)
                return out as any
            }
        }
    }
    static number(num:number|string):number;
    static number<T extends AdvField<any>>(num:T):T & {[s_jsonLiteral]:"number"}
    static number<T extends AdvField<any>>(num:T|number|string):T & {[s_jsonLiteral]:"number"}|number{
        switch(typeof num){
            case "number":
            case "string":{
                const out=Number(num)
                if(isNaN(out)) throw new Error("NaN is not supported by JSON")
                return out
            }
            default:{
                const out={
                    [s_jsonLiteral]:"number"
                }
                Object.setPrototypeOf(out,num)
                return out as any
            }
        }
    }

    static string(str:number|string|boolean):string;
    static string<T extends AdvField<any>>(str:T):T & {[s_jsonLiteral]:"string"}
    static string<T extends AdvField<any>>(str:T|boolean|number|string):T & {[s_jsonLiteral]:"string"}|string{
        switch(typeof str){
            case "boolean":
            case "number":
            case "string":{
                const out=String(str)
                return out
            }
            default:{
                const out={
                    [s_jsonLiteral]:"string"
                }
                Object.setPrototypeOf(out,str)
                return out as any
            }
        }
    }
    static boolean(bool:number|boolean|string):boolean;
    static boolean<T extends AdvField<any>>(bool:T):T & {[s_jsonLiteral]:"string"}
    static boolean<T extends AdvField<any>>(bool:T|number|boolean|string):T & {[s_jsonLiteral]:"string"}|boolean{
        switch(typeof bool){
            case "boolean":
            case "number":{
                const out=Boolean(bool)
                return out
            }
            case "string":{
                const out=JSON.parse(bool)
                if(typeof out != "boolean") throw new Error("")
                return out
            }
            default:{
                const out={
                    [s_jsonLiteral]:"boolean"
                }
                Object.setPrototypeOf(out,bool)
                return out as any
            }
        }
    }
}