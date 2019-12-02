import { Policy } from ".";
import { Field } from "aws-cf-builder-core/field";
import { stacktrace, generateObject, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { getShortStack } from "aws-cf-builder-core/utilLow"
import _ from "lodash/fp"
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";


/**
 * AWS::IAM::ManagedPolicy creates an AWS Identity and Access 
 * Management (IAM) managed policy for your AWS account, which 
 * you can use to apply permissions to IAM users, groups, and 
 * roles. For more information about managed policies, see 
 * Managed Policies and Inline Policies in the IAM User Guide 
 * guide.
 * 
 * [cloudfront reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-managedpolicy.html)
 */
export class ManagedPolicy extends Policy{
    readonly [resourceIdentifier]="AWS::IAM::ManagedPolicy" 
    //#region parameters
    protected _:Policy["_"] & {
        path:Field<string>
        description: Field<string>;
    }
    /**
     * the ARN.
     * such as `arn:aws:iam::123456789012:policy/teststack-CreateTestDBPolicy-16M23YE3CS700`
     */
    r:ReferenceField
    a={
        /**
         * the ARN.
         * such as `arn:aws:iam::123456789012:policy/teststack-CreateTestDBPolicy-16M23YE3CS700`
         */
        Arn:this.r
    }
    //#endregion
    constructor(){
        super();
        this[stacktrace]=getShortStack(1)
    }
    /**
     * @param pathName a combination of path and name. everything 
     * before and including the last slash is the path and 
     * everything after is the name
     * 
     * > **Important**
     * > 
     * > If you specify a name, you cannot perform updates that 
     * > require replacement of this resource. You can perform updates 
     * > that require no or some interruption. If you must replace the 
     * > resource, specify a new name.
     * 
     * **required:false**
     * 
     * **maps:** `ManagedPolicyName` & `Path`
     */
    name(pathName:string);
    /**
     * @param name A custom, friendly name for your IAM managed policy. 
     * For valid values, see the PolicyName parameter of the 
     * CreatePolicy action in the IAM API Reference.
     * 
     * **required:false**
     * 
     * **maps:** `ManagedPolicyName` & `Path`
     * 
     * > **Important**
     * > 
     * > If you specify a name, you cannot perform updates that 
     * > require replacement of this resource. You can perform updates 
     * > that require no or some interruption. If you must replace the 
     * > resource, specify a new name.
     */
    name(name:Field<string>);
    /**
     * 
     * @param path The path for the IAM policy. By default, the path is 
     * /. For more information, see IAM Identifiers in the IAM User 
     * Guide.
     * 
     * **required:false**
     * 
     * **maps:**`Path`
     * @param name A custom, friendly name for your IAM managed policy. 
     * For valid values, see the PolicyName parameter of the 
     * CreatePolicy action in the IAM API Reference.
     * 
     * 
     * **maps:** `ManagedPolicyName`
     * @param useName If you set this, AWS CloudFormation generates 
     * a unique physical ID and uses that ID for the Policy name.
     * 
     * > **Important**
     * > 
     * > If you specify a name, you cannot perform updates that 
     * > require replacement of this resource. You can perform updates 
     * > that require no or some interruption. If you must replace the 
     * > resource, specify a new name.
     */
    name(path:Field<string>,name:Field<string>);
    name(pathName:Field<string>,name?:Field<string>){
        if(typeof pathName=="string"){
            const split=pathName.lastIndexOf("/");
            this._.path=pathName.slice(0,split+1) || undefined;
            name=pathName.slice(split+1);
        }else{
            if(name==undefined){
                this._.name=pathName
            }else{
                this._.path=pathName
                this._.name=name
            }
        }
        return this;
    }
    //#region simple properties
    /**
     * **required:false**
     * @param description A description of the IAM policy. For example, 
     * describe the permissions that are defined in the policy.
     * 
     * **maps:**`Description`
     */
    description(description:Field<string>):this{
        this._.description=description;
        return this;
    }
    //#endregion
    
    //#region resource parameters
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:_.defaults(super[generateObject]().Properties,{
                Description:this._.description,
                Path:this._.path,
            })
        }
    }
    //#endregion
}