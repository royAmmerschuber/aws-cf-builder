import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, getRef, getName } from "../symbols";
import { SMap, ResourceError } from "../general";
import { stackPreparable } from "../stackBackend";
import { Resource } from "../generatables/resource";
import { pathItem } from "../path"

export class AttributeField extends InlineAdvField<any>{
    [resourceIdentifier]: string;
    static createMap(resource:Resource):SMap<AttributeField>{
        return new Proxy({},{
            get(target,p,reciever){
                if(typeof p!="string"){
                    throw new Error("not supported")
                }
                return new AttributeField(resource,p)
            },
            has(target,p){
                if(typeof p =="string"){
                    return true
                }else{
                    return false
                }
            }
        })
    }
    constructor(
        private resource:Resource,
        private attr:string
    ){ super(1) }

    toJSON() {
        return {"Fn::GetAtt":[
            this.resource[getName](),
            this.attr
        ]}
    }    
    [checkValid](): SMap<ResourceError> {
        return this.resource[checkValid]()
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        this.resource[prepareQueue](stack,path,true);
    }
}