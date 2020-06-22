import { Field } from "aws-cf-builder-core/field";
import { stacktrace, generateObject, resourceIdentifier, prepareQueue, checkValid, checkCache } from "aws-cf-builder-core/symbols";
import { getShortStack } from "aws-cf-builder-core/utilLow"
import { notEmpty, callOnCheckValid } from "aws-cf-builder-core/util"
import _ from "lodash/fp"
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { PolicyOut, PolicyDocument } from "./policy/policyDocument";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import { prepareQueueBase, callOnPrepareQueue } from "aws-cf-builder-core/util";
import { SMap, ResourceError } from "aws-cf-builder-core/general";


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
export class ManagedPolicy extends Resource{
    readonly [resourceIdentifier]="AWS::IAM::ManagedPolicy" 
    //#region parameters
    protected _: {
        name: Field<string>
        document: Field<PolicyOut>
        path:Field<string>
        description: Field<string>
    }={} as any
    protected roles: Field<string>[] = [];
    protected groups: Field<string>[] = [];
    protected users: Field<string>[] = [];
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
        Arn:this.r,
    }
    //#endregion
    constructor(){
        super(1)
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
    name(name:Field<string>):this;
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
    name(path:Field<string>,name:Field<string>):this;
    name(pathName:Field<string>,name?:Field<string>):this{
        if(typeof pathName=="string"){
            const split=pathName.lastIndexOf("/");
            this._.path=pathName.slice(0,split+1) || undefined;
            this._.name=pathName.slice(split+1);
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
    /**
     * **required:true**
     * 
     * **maps:** `PolicyDocument`
     * @param doc A policy document that contains permissions to add 
     * to the specified users or groups. 
     */
    Document(doc: Field<PolicyOut>|PolicyDocument) {
        this._.document = doc;
        return this;
    }
    //#endregion
    [checkValid]() {
        if (this[checkCache]) return this[checkCache]
        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (!this._.document) {
            errors.push("you must specify the Document")
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors: errors
            };
        }
        return this[checkCache] = callOnCheckValid(this._,out)
    }
    
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if (prepareQueueBase(stack,path,ref,this)) {
            callOnPrepareQueue(this._,stack, this, true)
        }else{
            if(path instanceof PathDataCarrier && "policyAttachment" in path.data){
                const {type,value}=path.data.policyAttachment;
                if(type=="group"){
                    this.groups.push(value)
                }else if(type=="role"){
                    this.roles.push(value)
                }else if(type=="user"){
                    this.users.push(value)
                }
            }
        }
    }
    //#region resource parameters
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                ManagedPolicyName:this._.name,
                Path:this._.path,
                PolicyDocument:this._.document,
                Description:this._.description,
                Roles:notEmpty(this.roles),
                Groups:notEmpty(this.groups),
                Users:notEmpty(this.users)
            }
        }
    }
    //#endregion
}