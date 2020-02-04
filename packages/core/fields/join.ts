import { InlineAdvField, Field } from "../field";
import { resourceIdentifier, checkValid, prepareQueue } from "../symbols";
import { SMap, ResourceError } from "../general";
import { stackPreparable } from "../stackBackend";
import { pathItem } from "../path";
import { callOnCheckValid, callOnPrepareQueue } from "../util";

export function Join(seperator:Field<string>,items:Field<string>[]|Field<string[]>){
    return new JoinField(seperator,items)
}
export class JoinField extends InlineAdvField<string>{
    [resourceIdentifier]="Join"
    constructor(
        private seperator:Field<string>,
        private items:Field<string>[]|Field<string[]>
    ){
        super(1)
    }

    toJSON() {
        if(typeof this.seperator=="string" && this.items instanceof Array && this.items.every(v=>typeof v=="string")){
            return this.items.join(this.seperator)
        }else{
            return {
                "Fn::Join":[this.seperator,this.items]
            }
        }
    }    
    [checkValid](): SMap<ResourceError> {
        return callOnCheckValid([this.seperator,this.items],{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean) {
        callOnPrepareQueue([this.seperator,this.items],stack,path,true)
    }


}