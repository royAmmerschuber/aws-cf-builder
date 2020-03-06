import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Tag } from "../../util";

export interface LifecycleRuleOut {
    AbortIncompleteMultipartUpload: {
        DaysAfterInitiation:Field<number>
    }
    ExpirationDate: Field<string>
    ExpirationInDays: Field<number>
    Id: Field<string>
    NoncurrentVersionExpirationInDays: Field<number>
    NoncurrentVersionTransition: VersionTransition
    NoncurrentVersionTransitions: VersionTransition[]
    Prefix: Field<string>
    Status: Field<string>
    TagFilters: Tag[]
    Transition: Transition
    Transitions: Transition[]
}
export interface Transition{
    StorageClass:Field<string>
    TransitionDate:Field<string>
    TransitionInDays:Field<string>
}
export interface VersionTransition{
    StorageClass:Field<string>
    TransitionInDays:Field<number>
}
//TODO
export class LifecycleRule extends InlineAdvField<LifecycleRuleOut>{
    [resourceIdentifier] = "LifecycleRule"
    toJSON() {
        throw new Error("Method not implemented.");
    }
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        throw new Error("Method not implemented.");
    }
}