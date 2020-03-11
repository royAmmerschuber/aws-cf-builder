import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Tag } from "../../util";
import { notEmpty, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";

export interface LifecycleRuleOut {
    AbortIncompleteMultipartUpload?: {
        DaysAfterInitiation: Field<number>
    }
    ExpirationDate?: Field<string>
    ExpirationInDays?: Field<number>
    Id?: Field<string>
    NoncurrentVersionExpirationInDays?: Field<number>
    NoncurrentVersionTransition?: VersionTransition
    NoncurrentVersionTransitions?: VersionTransition[]
    Prefix?: Field<string>
    Status: Field<string>
    TagFilters?: Tag[]
    Transition?: Transition
    Transitions?: Transition[]
}
export interface Transition {
    StorageClass: Field<string>
    TransitionDate: Field<string>
    TransitionInDays: Field<string>
}
export interface VersionTransition {
    StorageClass: Field<string>
    TransitionInDays: Field<number>
}
export type LifecycleState= "Disabled"|"Enabled"
export type StorageClass =
    "DEEP_ARCHIVE" |
    "GLACIER" |
    "INTELLIGENT_TIERING" |
    "ONEZONE_IA" |
    "STANDARD_IA"
//TODO
export class LifecycleRule extends InlineAdvField<LifecycleRuleOut>{
    [resourceIdentifier] = "LifecycleRule"
    private _: {
        id: Field<string>
        status:Field<string>
        prefix: Field<string>
        tagFilters:Tag[]
        abortMultipart: Field<number>
        expiration: Field<number | string>
        transitions: Map<Field<string>, {
            type: string,
            value: Field<number | string>
        }>
        noncurrentVersionExpiration: Field<number>
        noncurrentVersionTransitions: Map<Field<string>, Field<number>>
    } = {
        transitions:new Map(),
        noncurrentVersionTransitions: new Map(),
        tagFilters:[]
    } as any
    private expirationType: string
    /**
     * **required:false**
     * @param id Unique identifier for the rule. The value can't be longer than 255 characters.
     * 
     * **maps:**`Id`
     */
    id(id: Field<string>) {
        this._.id = id
        return this
    }
    /**
     * **required:false**
     * @param id If Enabled, the rule is currently being applied. If Disabled, the rule is not currently being applied.
     * 
     * **maps:**`Prefix`
     */
    prefix(prefix: Field<string>) {
        this._.prefix = prefix
        return this
    }
    /**
     * **required:false**
     * @param state If Enabled, the rule is currently being applied. If Disabled, the rule is not currently being applied.
     * 
     * **default:**`Enabled`
     * **maps:**`Status`
     */
    status(state:Field<LifecycleState>){
        this._.status=state
        return this
    }
    /**
     * An arbitrary set of tags (key–value pairs) to filter by.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
     * @param tags a map of tags
     */
    tagFilters(tags: SMap<Field<string>>): this;
    /**
     * @param key the tag key
     * @param value the tag value
     */
    tagFilters(key: Field<string>, value: Field<string>): this;
    tagFilters(tk: Field<string> | SMap<Field<string>>, value?: Field<string>): this {
        if (value != undefined) {
            this._.tagFilters.push({
                Key: tk as Field<string>,
                Value: value
            });
        } else {
            for (const k in tk as SMap<Field<string>>) {
                this._.tagFilters.push({
                    Key: k,
                    Value: tk[k]
                });
            }
        }
        return this;
    }
    /**
     * **required:conditional**
     * @param daysAfterInitiation Specifies a lifecycle rule that aborts incomplete multipart uploads to an Amazon S3 bucket.
     * 
     * You must specify at least one of the following properties: `abortIncompleteMultipartUpload`, `expiration`, `noncurrentVersionExpiration`, `noncurrentVersionTransitions` or `transitions`.
     * 
     * **maps:**`AbortIncompleteMultipartUpload.DaysAfterInitiation`
     */
    abortIncompleteMultipartUpload(daysAfterInitiation: Field<number>) {
        this._.abortMultipart = daysAfterInitiation
        return this
    }
    /**
     * You must specify at least one of the following properties: `abortIncompleteMultipartUpload`, `expiration`, `noncurrentVersionExpiration`, `noncurrentVersionTransitions` or `transitions`.
     * 
     * **required:conditional**
     * @param type type of expiration
     * @param days Indicates the number of days after creation when objects are deleted from Amazon S3 and Amazon S3 Glacier. If you specify an expiration and transition time, you must use the same time unit for both properties (either in days or by date). The expiration time must also be later than the transition time.
     * 
     * **maps:**`ExpirationInDays`
     */
    expiration(type: "days", days: Field<number>): this
    /**
     * @param type type of expiration
     * @param date Indicates when objects are deleted from Amazon S3 and Amazon S3 Glacier. The date value must be in ISO 8601 format. The time is always midnight UTC. If you specify an expiration and transition time, you must use the same time unit for both properties (either in days or by date). The expiration time must also be later than the transition time.
     * 
     * **maps:**`ExpirationDate`
     */
    expiration(type: "date", date: Field<string>): this
    expiration(type: string, value: Field<number | string>) {
        this._.expiration[type] = value
        return this
    }

    /**
     * You must specify at least one of the following properties: `abortIncompleteMultipartUpload`, `expiration`, `noncurrentVersionExpiration`, `noncurrentVersionTransitions` or `transitions`.
     * 
     * **required:conditional**
     * @param type type of expiration
     * @param to The storage class to which you want the object to transition.
     * 
     * **maps:**`Transitions[].StorageClass`
     * @param days Indicates the number of days after creation when objects are transitioned to the specified storage class. The value must be a positive integer.
     * 
     * **maps:**`Transition[].TransitionInDays`
     */
    transitions(type: "days", to: Field<StorageClass>, days: Field<number>)
    /**
     * @param type type of expiration
     * @param to The storage class to which you want the object to transition.
     * 
     * **maps:**`Transitions[].StorageClass`
     * @param date Indicates when objects are transitioned to the specified storage class. The date value must be in ISO 8601 format. The time is always midnight UTC.
     * 
     * **maps:**`Transition[].TransitionDate`
     */
    transitions(type: "date", to: Field<StorageClass>, days: Field<string>)
    transitions(type: string, to: Field<StorageClass>, value: Field<number|string>) {
        this._.transitions.set(to, {
            value,
            type
        })
        return this
    }
    /**
     * **required:conditional**
     * @param days For buckets with versioning enabled (or suspended), specifies the time, in days, between when a new version of the object is uploaded to the bucket and when old versions of the object expire. When object versions expire, Amazon S3 permanently deletes them. If you specify a transition and expiration time, the expiration time must be later than the transition time.
     * 
     * You must specify at least one of the following properties: `abortIncompleteMultipartUpload`, `expiration`, `noncurrentVersionExpiration`, `noncurrentVersionTransitions` or `transitions`.
     * 
     * **maps:**`NoncurrentVersionExpirationInDays`
     */
    noncurrentVersionExpiration(days: Field<number>) {
        this._.noncurrentVersionExpiration = days
        return this
    }
    /**
     * You must specify at least one of the following properties: `abortIncompleteMultipartUpload`, `expiration`, `noncurrentVersionExpiration`, `noncurrentVersionTransitions` or `transitions`.
     * 
     * **required:conditional**
     * @param to The class of storage used to store the object.
     * 
     * **maps:**`NoncurrentVersionTransitions[].StorageClass`
     * @param days For buckets with versioning enabled (or suspended), one or more transition rules that specify when non-current objects transition to a specified storage class. If you specify a transition and expiration time, the expiration time must be later than the transition time. If you specify this property, don't specify the NoncurrentVersionTransition property.
     * 
     * **maps:**`NoncurrentVersionTransitions[].TransitionInDays`
     */
    noncurrentVersionTransitions(to: Field<StorageClass>, days: Field<number>) {
        this._.noncurrentVersionTransitions.set(to, days)
        return this
    }
    toJSON():LifecycleRuleOut {
        return {
            Id:this._.id,
            Status:this._.status ?? "Enabled",
            Prefix:this._.prefix,
            TagFilters:notEmpty(this._.tagFilters),
            AbortIncompleteMultipartUpload:this._.abortMultipart && {
                DaysAfterInitiation:this._.abortMultipart
            },
            ExpirationDate:this.expirationType=="date" ? this._.expiration as any: undefined,
            ExpirationInDays:this.expirationType=="days" ? this._.expiration as any: undefined,
            NoncurrentVersionExpirationInDays:this._.noncurrentVersionExpiration,
            NoncurrentVersionTransitions:notEmpty([...this._.noncurrentVersionTransitions].map(([klass,days])=>({
                StorageClass:klass,
                TransitionInDays:days
            }))),
            Transitions:notEmpty([...this._.transitions].map(([k,v])=>({
                StorageClass:k,
                TransitionDate:v.type=="date" ? v.value as any : undefined,
                TransitionInDays:v.type=="days" ? v.value as any : undefined
            }))),
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(
            !this._.expiration && !this._.transitions.size &&
            !this._.abortMultipart && !this._.noncurrentVersionExpiration &&
            !this._.noncurrentVersionTransitions.size
        ){
            errors.push("You must specify at least one of the following properties: `abortIncompleteMultipartUpload`, `expiration`, `noncurrentVersionExpiration`, `noncurrentVersionTransitions` or `transitions`.")
        }
        const trans=[...this._.transitions]
        if( this.expirationType && trans.length){
            const comp=this.expirationType ?? trans[0][1].type
            if(!trans.every(([,v])=>v.type==comp)){
                errors.push("you must use everywhere the same type either `days` or `date`")
            }
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }
}