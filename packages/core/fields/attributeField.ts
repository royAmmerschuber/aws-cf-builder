import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, getName, toJson } from "../symbols";
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
    constructor(resource:Resource,attr:string)
    constructor(pseudoAttribute:string,attr:string)
    constructor(private resource:Resource|string,private attr:string){ super(1) }

    [toJson]() {
        const resourceName=this.resource instanceof Resource ? this.resource[getName]() : this.resource
        return {"Fn::GetAtt":[ resourceName, this.attr ]}
    }    
    [checkValid](): SMap<ResourceError> {
        if(this.resource instanceof Resource){
            return this.resource[checkValid]()
        }else{
            return {}
        }
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(this.resource instanceof Resource){
            this.resource[prepareQueue](stack,path,true);
        }
    }
}