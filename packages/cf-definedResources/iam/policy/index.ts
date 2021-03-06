import _ from "lodash/fp";

import { PolicyDocument, PolicyStatement, PolicyOut } from "./policyDocument";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { prepareQueueBase, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
import { Field } from "aws-cf-builder-core/field";
import { notEmpty } from "aws-cf-builder-core/util";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { checkValid, stacktrace, resourceIdentifier, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

/**
 * The AWS::IAM::Policy resource associates an IAM policy with IAM users, 
 * roles, or groups. For more information about IAM policies, see 
 * Overview of IAM Policies in the IAM User Guide guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-policy.html)
 */
export class Policy extends Resource {
    readonly [resourceIdentifier]:string = "AWS::IAM::Policy";
    //#region parameters
    protected _: {
        name: Field<string>
        document: Field<PolicyOut>
    } = {} as any

    protected roles: Field<string>[] = [];
    protected groups: Field<string>[] = [];
    protected users: Field<string>[] = [];
    //#endregion
    /**
     * the resource name.
     */
    r: ReferenceField
    constructor() { super(1); }
    /**
     * **required:true**
     * 
     * **maps:** `PolicyName`
     * @param name The name of the policy. If you specify multiple 
     * policies for an entity, specify unique names. For example, if 
     * you specify a list of policies for an IAM role, each policy 
     * must have a unique name.
     */
    Name(name: Field<string>) {
        this._.name = name
        return this;
    }
    //#region virtual subresources
    /**
     * **required:true**
     * 
     * **maps:** `PolicyDocument`
     * @param doc A policy document that contains permissions to add 
     * to the specified users or groups. 
     */
    Document(doc: Field<PolicyOut>) {
        this._.document = doc;
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        if (this[checkCache]) return this[checkCache]
        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (!this._.name) {
            errors.push("you must specify the Name")
        }
        if (!this._.document) {
            errors.push("you must specify the Document")
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors: errors
            };
        }
        return this[checkCache] = callOnCheckValid(this._, out)
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

    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: {
                PolicyName: this._.name,
                PolicyDocument: this._.document,
                Roles: notEmpty(this.roles),
                Groups: notEmpty(this.groups),
                Users: notEmpty(this.users),
            }
        }
    }
    //#endregion
}
export namespace Policy {
    export const Document = PolicyDocument
    export type Document = PolicyDocument

    export const Statement = PolicyStatement
    export type Statement = PolicyStatement
}
