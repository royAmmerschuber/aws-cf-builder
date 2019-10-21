import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, getRef } from "../symbols";
import { SMap, ResourceError, pathItem } from "../general";
import { modulePreparable } from "../stackBackend";
import { Resource } from "../generatables/resource";

export class AttributeField extends InlineAdvField<any>{
    [resourceIdentifier]: string;
    static createMap(resource:Resource):SMap<AttributeField>{
        return new Proxy({},{
            get(target,p,reciever){
                if(typeof p!="string"){
                    throw new Error("not supported")
                }
                return new AttributeField(resource,p)
            }
        })
    }
    constructor(
        private resource:Resource,
        private attr:string
    ){ super(1) }

    toJSON() {
        return {"Fn::GetAtt":[
            this.resource[getRef]().Ref,
            this.attr
        ]}
    }    
    [checkValid](): SMap<ResourceError> {
        return this.resource[checkValid]()
    }
    [prepareQueue](mod: modulePreparable, path: pathItem, ref: boolean): void {
        this.resource[prepareQueue](mod,path,true);
    }
}