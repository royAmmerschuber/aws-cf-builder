
import { Group } from "./group";
import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { resourceIdentifier, checkValid, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { prepareQueueBase, findInPath } from "aws-cf-builder-core/util";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

/**
 * The AWS::IAM::UserToGroupAddition type adds AWS Identity
 * and Access Management (IAM) users to a group.
 * 
 * This type supports updates. For more information about 
 * updating stacks, see AWS CloudFormation Stacks Updates.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-iam-addusertogroup.html)
 */
export class UTG extends Resource{
    readonly [resourceIdentifier]="AWS::IAM::UserToGroupAddition"
    private group:Field<string>
    /**
     * the resource name
     */
    r:ReferenceField
    /**
     * 
     * @param users
     * **maps:** `Users` 
     */
    constructor(
        private users:Field<string>[]
    ){super(1)}
    //#region resource functions
    [checkValid](){
        return {}
    }
    [prepareQueue](stack: stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            const { group }=findInPath(path,{group:Group})
            this.group=group.obj.r
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                GroupName:this.group,
                Users:this.users
            }
        }
    }
    //#endregion
}