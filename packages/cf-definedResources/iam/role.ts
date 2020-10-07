import { PolicyOut, PrincipalKeys } from "./policy/policyDocument";
import { URG } from "./urg";
import { Field } from "aws-cf-builder-core/field";
import { Local } from "aws-cf-builder-core/fields/local";
import { Attr, prepareQueueBase, callOnPrepareQueue, thrw } from "aws-cf-builder-core/util";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { checkValid, stacktrace, checkCache, prepareQueue, generateObject, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { Preparable, PreparableError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import _ from "lodash/fp"
import { ManagedPolicy } from "./managedPolicy";
import { InstanceProfile } from "./instanceProfile";
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

    protected _: URG["_"] & {
        maxDuration: Field<number>
        permissionBoundary: Field<string>
        instanceProfile: boolean
        assumePolicy:Field<PolicyOut>
    }
    private instanceProfileR=new InstanceProfile(this)
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
        RoleId: new AttributeField(this, "RoleId"),
        instanceProfileArn: Local(() => this._.instanceProfile ? this.instanceProfileR.a.Arn : thrw(new PreparableError(this,"you cannot reference the instanceProfile without activating it"))),
        instanceProfileName: Local(() => this._.instanceProfile ? this.instanceProfileR.r : thrw(new PreparableError(this,"you cannot reference the instanceProfile without activating it")))
    }
    constructor() {
        super(1);
    }

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
    AssumePolicy(doc:Field<PolicyOut>|Policy.Document):this
    AssumePolicy(universal: "*"): this;
    /**
     * @param from the type of resource you want to give these permissions to
     * @param principals the resources you want to give the permissions to
     */
    AssumePolicy(from: PrincipalKeys, ...principals: Field<string>[]): this
    AssumePolicy(df: Field<PolicyOut|PrincipalKeys|"*">,...principals:Field<string>[]) {
        if(typeof df=="string"){
            if(df=="*"){
                this._.assumePolicy=new Policy.Document()
                    .Statement(new Policy.Statement()
                        .Actions("sts:AssumeRole")
                        .principals(df))
            }else{
                this._.assumePolicy=new Policy.Document()
                    .Statement(new Policy.Statement()
                        .Actions("sts:AssumeRole")
                        .principals(df,...principals))
            }
        }else{
            this._.assumePolicy = df
        }
        return this
    }

    /**
     * **required:false**
     * @param permissionBoundary The ARN of the policy that is used 
     * to set the permissions boundary for the role. Minimum length 
     * of 20. Maximum length of 2048.
     * 
     * **maps:**`PermissionBoundary`
     */
    permissionBoundary(permissionBoundary: Attr<ManagedPolicy>): this {
        this._.permissionBoundary = Attr.get(permissionBoundary, "Arn");
        return this;
    }
    instanceProfile():this
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
    instanceProfile(pathName:string):this;
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
    instanceProfile(name:Field<string>):this;
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
    instanceProfile(path:Field<string>,name:Field<string>):this;
    instanceProfile(pathName?:Field<string>,name?:Field<string>):this{
        this._.instanceProfile=true
        this.instanceProfileR.name(pathName,name)
        return this;
    }

    [checkValid]() {
        if (this[checkCache]) return this[checkCache]
        const out = super[checkValid]();;
        const errors: string[] = []
        if (!this._.assumePolicy) {
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
            callOnPrepareQueue(this._, stack, this, true)

            if (this._.assumePolicy instanceof Preparable) this._.assumePolicy[prepareQueue](stack, new PathDataCarrier(this, { skipResources: true }), false)
            this.policiesR.forEach(o => o[prepareQueue](stack, new PathDataCarrier(this, { policyAttachment: { type: "role", value: this.r } }), true))
            if(this._.instanceProfile){
                this.instanceProfileR[prepareQueue](stack,this,false)
            } 
        }
    }
    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: _.defaults(super[generateObject]().Properties, {
                RoleName: this._.name,
                MaxSessionDuration: this._.maxDuration,
                AssumeRolePolicyDocument: this._.assumePolicy,
                PermissionBoundary: this._.permissionBoundary
            })
        }
    }
}