
import { Field } from "aws-cf-builder-core/field";
import { prepareQueueBase, callOnCheckValid, callOnPrepareQueue, findInPath, Attr } from "aws-cf-builder-core/util";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { checkValid, checkCache, prepareQueue, generateObject, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import _ from "lodash/fp"
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Role } from "./role";
import { PreparableError } from "aws-cf-builder-core/general";

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
    public _: {
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
    constructor() {
        super(1);
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        if (this[checkCache]) return this[checkCache]
        return this[checkCache] = callOnCheckValid(this._,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if (prepareQueueBase(stack, path, ref, this)) {
            callOnPrepareQueue(this._, stack, this, true)
            const { role } = findInPath(path,{role:Role})
            if(!role) throw new PreparableError(this,"instanceProfile missing role")
            this._.role=role.obj.r
        }
    }
    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: {
                InstanceProfileName: this._.name,
                Path:this._.path,
                Roles:[this._.role]
            }
        }
    }
    //#endregion
}