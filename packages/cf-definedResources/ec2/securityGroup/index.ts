import { Resource } from "aws-cf-builder-core/generatables/resource";
import { generateObject, resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general"
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Field } from "aws-cf-builder-core/field";
import { Tag } from "../../util";
import { IngressOut, EgressOut, Ingress as _Ingress, Egress as _Egress } from "./gress";
import { notEmpty, callOnCheckValid, prepareQueueBase, callOnPrepareQueue } from "aws-cf-builder-core/util";

export class SecurityGroup extends Resource{
    [resourceIdentifier]="AWS::EC2::SecurityGroup"
    private _:{
        description:Field<string>
        name:Field<string>
        vpcId:Field<string>
        tags:Tag[]
        ingress:Field<IngressOut>[]
        egress:Field<EgressOut>[]
    }={
        ingress:[],
        egress:[],
        tags:[]
    } as any
    constructor(){
        super(2)
    }
    /**
     * **required:false**
     * @param name The name of the security group.
     *
     * Constraints: Up to 255 characters in length. Cannot start with sg-.
     *
     * Constraints for EC2-Classic: ASCII characters
     *
     * Constraints for EC2-VPC: a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=&;{}!$*
     * 
     * **maps:**`GroupName`
     */
    name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:true**
     * @param text A description for the security group. This is informational only.
     * 
     * Constraints: Up to 255 characters in length
     * 
     * Constraints for EC2-Classic: ASCII characters
     * 
     * Constraints for EC2-VPC: a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=&;{}!$*
     * 
     * **maps:**`GroupDescription`
     */
    Description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * **required:false**
     * @param id [VPC only] The ID of the VPC for the security group.
     * 
     * **maps:**`VpcId`
     */
    vpcId(id:Field<string>){
        this._.vpcId=id
        return this
    }
    /**
     * **required:false**
     * @param ingress The inbound rules associated with the security group. There is a short 
     * interruption during which you cannot connect to the security group.
     * 
     * **maps:**`SecurityGroupIngress`
     */
    ingress(...ingress:(Field<IngressOut>|_Ingress)[]){
        this._.ingress.push(...ingress)
        return this
    }
    /**
     * **required:false**
     * @param egress [VPC only] The outbound rules associated with the security group. There 
     * is a short interruption during which you cannot connect to the security group.
     * 
     * **maps:**`GroupDescription`
     */
    egress(...egress:(Field<EgressOut>|_Egress)[]){
        this._.egress.push(...egress)
        return this
    }
    /**
     * An arbitrary set of tags (key–value pairs) for this Lambda function.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
     * @param tags a map of tags
     */
    tag(tags:SMap<Field<string>>):this;
    /**
     * @param key the key of a new tag
     * @param value the value for the tag
     */
    tag(key:Field<string>,value:Field<string>):this;
    tag(tk:Field<string>|SMap<Field<string>>,value?:Field<string>):this{
        if(value!=undefined){
            this._.tags.push({
                Key:tk as Field<string>,
                Value:value
            });
        }else{
            for(const k in tk as SMap<Field<string>>){
                this._.tags.push({
                    Key:k,
                    Value:tk[k]
                });
            }
        }
        return this;
    }

    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                GroupDescription : this._.description,
                GroupName : this._.name,
                SecurityGroupEgress : notEmpty(this._.egress),
                SecurityGroupIngress : notEmpty(this._.ingress),
                Tags : notEmpty(this._.tags),
                VpcId : this._.vpcId
            }
        }
    }
    [checkValid]():SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.description) errors.push("you must specify a description")
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true)
        }
    }

}
export namespace SecurityGroup{
    export const Egress=_Egress
    export type Egress=_Egress

    export const Ingress=_Ingress
    export type Ingress=_Ingress
}