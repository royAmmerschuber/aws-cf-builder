import { PolicyOut } from "./policy/policyDocument";
import { URG } from "./urg";
import { Field } from "aws-cf-builder-core/field";
import { Attr, prepareQueueBase, callOn } from "aws-cf-builder-core/util";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { checkValid, stacktrace, checkCache, prepareQueue, generateObject, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { Preparable } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import _ from "lodash/fp"
import { Policy } from "./policy";

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
export class Role extends URG {
    readonly [resourceIdentifier] = "AWS::IAM::Role";

    //#region parameters
    protected _: URG["_"] & {
        maxDuration: Field<number>
        permissionBoundary: Field<string>
    }
    assumePolicy: Field<PolicyOut>
    /**
     * returns the resource name
     */
    r: ReferenceField
    a = {
        /**
         * Returns the Amazon Resource Name (ARN) for the role. For example:
         * `arn:aws:iam::1234567890:role/MyRole-AJJHDSKSDF`
         */
        Arn: new AttributeField(this, "Arn"),
        /**
         * Returns the stable and unique string identifying the role. For example, `AIDAJQABLZS4A3QDU576Q`.
         * 
         * For more information about IDs, see [IAM Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_identifiers.html)
         * in the IAM User Guide.
         */
        RoleId: new AttributeField(this, "RoleId")
    }
    //#endregion
    constructor() {
        super(1);
    }
    //#endregion

    //#region simple properties
    /**
     * **required:false**
     * 
     * **maps:** `MaxSessionDuration`
     * @param dur The maximum session duration (in seconds) for the 
     * specified role. Anyone who uses the AWS CLI or API to assume 
     * the role can specify the duration using the optional 
     * DurationSeconds API parameter or duration-seconds CLI 
     * parameter. Minimum value of 3600. Maximum value of 43200.
     */
    maxDuration(dur: Field<number>) {
        this._.maxDuration = dur
        return this
    }

    //#endregion

    //#region virtual subresources
    /**
     * **required:true**
     * 
     * **maps:** `AssumeRolePolicyDocument`
     * @param doc The trust policy that is associated with this role. 
     * You can associate only one assume role policy with a role. For 
     * an example of an assume role policy, see Template Examples. 
     * For more information about the elements that you can use in an 
     * IAM policy, see IAM Policy Elements Reference in the IAM User 
     * Guide.
     */
    AssumePolicy(doc: Field<PolicyOut>) {
        this.assumePolicy = doc
        return this
    }
    //#endregion

    //#region sub resources
    /**
     * **required:false**
     * @param permissionBoundary The ARN of the policy that is used 
     * to set the permissions boundary for the role. Minimum length 
     * of 20. Maximum length of 2048.
     * 
     * **maps:**`PermissionBoundary`
     */
    permissionBoundary(permissionBoundary: Attr<Policy.Managed>): this {
        this._.permissionBoundary = Attr.get(permissionBoundary, "Arn");
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        if (this[checkCache]) return this[checkCache]
        const out = super[checkValid]();;
        const errors: string[] = []
        if (!this.assumePolicy) {
            errors.push("you must specify the AssumePolicy")
        }
        if (errors.length) {
            const e = out[this[stacktrace]];
            if (e) {
                e.errors.push(...errors);
            } else {
                out[this[stacktrace]] = {
                    type: this[resourceIdentifier],
                    errors: errors
                };
            }
        }
        return this[checkCache] = out;
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if (prepareQueueBase(stack, path, ref, this)) {
            callOn(this._, Preparable as any, (o: Preparable) => o[prepareQueue](stack, this, true))

            if (this.assumePolicy instanceof Preparable) this.assumePolicy[prepareQueue](stack, new PathDataCarrier(this, { skipResources: true }), false)
            this.policiesR.forEach(o => o[prepareQueue](stack, new PathDataCarrier(this, { policyAttachment: { type: "role", value: this.r } }), true))
        }
    }
    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: _.defaults(super[generateObject]().Properties, {
                RoleName: this._.name,
                MaxSessionDuration: this._.maxDuration,
                AssumeRolePolicyDocument: this.assumePolicy,
                PermissionBoundary: this._.permissionBoundary
            })
        }
    }
    //#endregion
}
