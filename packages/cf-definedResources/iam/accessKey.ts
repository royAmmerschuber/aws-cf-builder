import { User } from "./user";
import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, checkCache, pathName } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, namedPath } from "aws-cf-builder-core/path";
import { prepareQueueBase, callOn, findInPath } from "aws-cf-builder-core/util";
import { Preparable, SMap, ResourceError } from "aws-cf-builder-core/general";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";

export class AccessKey extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::IAM::AccessKey"
    //#region parameters
    private _:{
        status: Field<"Active"|"Inactive">
        serial: Field<number>

        userName:Field<string>
    }={} as any
    //#endregion

    /**
     * the AccessKeyId. For example: `AKIAIOSFODNN7EXAMPLE`.
     */
    r:ReferenceField
    a={
        /**
         * the secret access key for the specified AWS::IAM::AccessKey resource. 
         * For example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY`.
         */
        SecretAccessKey:new AttributeField(this,"SecretAccessKey")
    }
    /**
     * @param name a name used to generate the logical id
     */
    constructor(private name:string="Main"){super(1)}
    //#region simple properties
    /**
     * **required:false**
     * @param status The status of the access key. By default, 
     * AWS CloudFormation sets this property value to Active.
     * 
     * **maps:**`Status`
     */
    status(status:Field<"Active"|"Inactive">):this{
        this._.status=status;
        return this;
    }
    /**
     * **required:false**
     * @param serial This value is specific to AWS CloudFormation 
     * and can only be incremented. Incrementing this value 
     * notifies AWS CloudFormation that you want to rotate your 
     * access key. When you update your stack, AWS CloudFormation 
     * will replace the existing access key with a new key.
     * 
     * **maps:**`Serial`
     */
    serial(serial:Field<number>):this{
        this._.serial=serial;
        return this;
    }
    //#endregion
    [checkValid]() {
        if(this[checkCache])return this[checkCache]
        return this[checkCache]=callOn(this._,Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,{})
    }
    [prepareQueue](stack: stackPreparable, path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))
            const {user}=findInPath(path,{user:User})
            this._.userName=user.obj.r
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                UserName:this._.userName,
                Serial:this._.serial,
                Status:this._.status
            }
        }
    }
    [pathName](){
        return this.name
    }
}