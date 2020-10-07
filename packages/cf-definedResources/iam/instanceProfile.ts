
import { Field } from "aws-cf-builder-core/field";
import { prepareQueueBase, callOnCheckValid, callOnPrepareQueue, findInPath, Attr, Ref } from "aws-cf-builder-core/util";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { checkValid, checkCache, prepareQueue, generateObject, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import _ from "lodash/fp"
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Role } from "./role";
import { PreparableError, ResourceError, SMap } from "aws-cf-builder-core/general";

/**
 * Creates an AWS Identity and Access Management (IAM) role. Use an IAM 
 * role to enable applications running on an EC2 instance to securely 
 * access your AWS resources.
 * 
 * For more information about IAM roles, see Working with Roles in the AWS 
 * Identity and Access Management User Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html)
 */
export class InstanceProfile extends Resource {
    readonly [resourceIdentifier] = "AWS::IAM::InstanceProfile";

    //#region parameters
    private _: {
        name:Field<string>
        path:Field<string>
        role:Field<string>
    }={} as any
    /**
     * returns the resource name
     */
    r: ReferenceField
    a = {
        /**
         * Returns the Amazon Resource Name (ARN) for the role. For example:
         * `arn:aws:iam::1234567890:instance-profile/MyProfile-ASDNSDLKJ`
         */
        Arn: new AttributeField(this, "Arn"),
    }
    //#endregion
    constructor()
    /**@param role only for internal use */
    constructor(role:Role)
    constructor(private role?:Role) {
        super(1);
    }
    Role(roleArn:Ref<Role>){
        this._.role=Ref.get(roleArn)
        return this
    }
    name():this
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
    name(pathName:string):this;
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
    name(pathName?:Field<string>,name?:Field<string>):this{
        if(pathName==undefined) return this

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
    //#region resource functions
    [checkValid]() {
        if (this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        if(!(this._.role || this.role)){
            out[this[stacktrace]]={
                errors:["you must specify a role"],
                type:this[resourceIdentifier]
            }
        }
        return this[checkCache] = callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if (this.role && ref){
            this.role[prepareQueue](stack,path,true)
            return
        }
        if (prepareQueueBase(stack, path, ref, this)) {
            callOnPrepareQueue(this._, stack, this, true)
        }
    }
    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: {
                InstanceProfileName: this._.name,
                Path:this._.path,
                Roles:[this.role 
                    ? this.role.r
                    : this._.role]
            }
        }
    }
    //#endregion
}