import _ from "lodash/fp";

import { URG as URG } from "./urg";
import { User } from "./user";
import { Field } from "aws-cf-builder-core/field";
import { Ref, prepareQueueBase, callOn } from "aws-cf-builder-core/util";
import { checkValid, prepareQueue, generateObject, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import { Preparable } from "aws-cf-builder-core/general";
import { UTG } from "./utg";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
/**
 * The AWS::IAM::Group resource creates an AWS Identity and Access 
 * Management (IAM) group.
 * 
 * This type supports updates. For more information about updating 
 * stacks, see AWS CloudFormation Stacks Updates.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-iam-group.html)
 */
export class Group extends URG{
    readonly [resourceIdentifier]="AWS::IAM::Group"
    //#region parameters
    protected _:URG["_"] & {
        users: Field<string>[]
    }
    //#endregion
    /**
     * the GroupName. For example: `mystack-mygroup-1DZETITOWEKVO`
     */
    r:ReferenceField
    a={
        /**
         * the Amazon Resource Name (ARN) for the specified 
         * AWS::IAM::Group resource. For example: 
         * `arn:aws:iam::123456789012:group/mystack-mygroup-1DZETITOWEKVO`.
         */
        Arn:new AttributeField(this,"Arn")
    }
    constructor(){
        super(2)
        this._.users=[]
    }
    /**
     * **required:false** 
     * @param users a list of users to add to this role.
     * this creates a UTG wich adds the users to the role
     */
    user(...users:Ref<User>[]):this{
        this._.users.push(...users.map(v=>Ref.get(v)))
        return this
    }
    //#region resource functions
    [checkValid](){
        return super[checkValid]();
    }
    [prepareQueue](stack: stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            this.policiesR.forEach(v => v[prepareQueue](stack,new PathDataCarrier(this,{policyAttachment:{type:"group",value:this.r}}),true));
            callOn(this._,Preparable,o=>o[prepareQueue](stack,this,true))
            if(this._.users.length){
                new UTG(this._.users)[prepareQueue](stack,this,false);
            }
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:_.defaults(super[generateObject]().Properties,{
                GroupName:this._.name
            })
        }
    }
    //#endregion
}