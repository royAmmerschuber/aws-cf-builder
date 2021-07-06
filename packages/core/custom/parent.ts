import { SMap, Preparable, PreparableError } from "../general";
import { InlineAdvField } from "../field";
import { resourceIdentifier, s_path, prepareQueue, toJson } from "../symbols";
import { Resource } from "../generatables/resource";
import { ReferenceField } from "../fields/referenceField";
import { AttributeField } from "../fields/attributeField";
import { pathItem } from "../path";
import { getShortStack } from "../utilLow";
type refPack={ r: ReferenceField, a: SMap<AttributeField> }
export const Parent: SMap<SMap<refPack>>&((type:new (...args:any)=>Resource)=>refPack) = new Proxy(class{
    static subHandler= {
        get(target:{area:string},p){
            if (typeof p != "string") {
                throw new Error("non string property access not allowed on parent reference")
            }
            return {
                r:new PReferenceField(undefined,target.area,p),
                a:PAttributeField.createPMap(undefined,target.area,p)
            }
        }
    } as ProxyHandler<{area:string}>
}, {
    get(target, p) {
        if (typeof p != "string") {
            throw new Error("non string property access not allowed on parent reference")
        }
        return new Proxy({
            area:p
        },target.subHandler)
    },
    apply(_target,_thisArg,[resource]:[new ()=>Resource]){
        return {
            r:new PReferenceField(resource,undefined,undefined),
            a:PAttributeField.createPMap(resource,undefined,undefined)
        }
    }
}) as any

function getParent(This:InlineAdvField<any>,parent:(new()=>Resource)|string){
    const rec = (path: pathItem) => {
        if (path && !(path instanceof Array)) {
            if (path instanceof Resource) {
                if(typeof parent=="string"){
                    if (path[resourceIdentifier] == parent) {
                        return path
                    }
                }else{
                    if(path instanceof parent){
                        return path
                    }
                }
            }
            return rec(path[s_path])
        }
        throw new PreparableError(This,`parent resource ${typeof parent=="string" ? parent : parent.name} not found`)
    }
    return rec(This[s_path])
}
class PReferenceField extends ReferenceField{
    protected get resource(){
        return getParent(this,this.type ?? `AWS::${this.area}::${this.name}`)
    }
    protected set resource(_r:Resource){}
    constructor(private type:new()=>Resource,private area:string,private name:string){
        super(undefined,true)
    }
    [prepareQueue](_stack,path:pathItem,_req){
        if(!this[s_path]){
            this[s_path]=path
        }
    }
}

class PAttributeField extends AttributeField{
    private static mapHandler:ProxyHandler<{resource:new()=>Resource,area:string,name:string,stack:string}>={
        get(target,p,rec){
            if (p==toJson){
                throw new PreparableError(target.stack,"attributeMap","you forgot to specify which attribute to get with your parent reference")
            }
            if (typeof p != "string") {
                throw new PreparableError(target.stack,"attributeMap","non string property access not allowed")
            }
            return new PAttributeField(target.resource,target.area,target.name,p)
        }
    }
    static createPMap(resource:new()=>Resource,area:string,name:string){
        return new Proxy({
            resource,
            area,
            name,
            stack:getShortStack(2)
        },PAttributeField.mapHandler)
    }
    protected get resource(){
        return getParent(this,this.type ?? `AWS::${this.area}::${this.name}`)
    }
    protected set resource(_r:Resource){}
    constructor(private type:new()=>Resource,private area:string,private name:string,attr:string){
        super(undefined,attr,true)
    }
    [prepareQueue](_stack,path:pathItem,_req){
        if(!this[s_path]){
            this[s_path]=path
        }
    }
}
