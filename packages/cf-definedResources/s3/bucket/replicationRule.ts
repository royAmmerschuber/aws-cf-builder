import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { callOnPrepareQueue, callOnCheckValid, Attr } from "aws-cf-builder-core/util";
import { Bucket } from ".";

export interface ReplicationRuleOut{
    Destination:{
        AccessControlTranslation?:{
            Owner:Field<string>
        }
        Account?:Field<string>
        Bucket:Field<string>
        EncryptionConfiguration?:{
            ReplicaKmsKeyID:Field<string>
        }
        StorageClass?:Field<string>
    }
    SourceSelectionCriteria?:{
        SseKmsEncryptedObjects:{
            Status:Field<string>
        }
    }
    Id:Field<string>
    Prefix:Field<string>
    Status:Field<string>
}
export type StorageClassRep=
    "DEEP_ARCHIVE" |
    "GLACIER" |
    "INTELLIGENT_TIERING" |
    "ONEZONE_IA" |
    "REDUCED_REDUNDANCY" |
    "STANDARD" |
    "STANDARD_IA"
export class ReplicationRule extends InlineAdvField<ReplicationRuleOut>{
    [resourceIdentifier]="ReplicationRule"
    private _:{
        destinationKey:Field<string>
        destinationOwner:Field<string>
        bucket:Field<string>
        storageClass:Field<string>
        encryptedReplication:Field<string>
        id:Field<string>
        prefix:Field<string>
        status:Field<string>
    }={ } as any
    constructor(){super(1)}
    /**
     * **required:true**
     * @param id A unique identifier for the rule. The maximum value is 255 characters. If you don't specify a
     * value, AWS CloudFormation generates a random ID.
     * 
     * **maps:**`Id`
     */
    Id(id:Field<string>){
        this._.id=id
        return this
    }
    /**
     * **required:true**
     * @param prefix An object key name prefix that identifies the object or objects to which the rule applies.
     * The maximum prefix length is 1,024 characters. To include all objects in a bucket, specify an empty string.
     * 
     * **maps:**`Prefix`
     */
    Prefix(prefix:Field<string>){
        this._.prefix=prefix
        return this
    }
    /**
     * **required:false**
     * @param state Specifies whether the rule is enabled.
     * 
     * **default:**`Enabled`
     * 
     * **maps:**`Status`
     */
    status(state:Field<"Disabled"|"Enabled">){
        this._.status=state
        return this
    }
    /**
     * A container that describes additional filters for identifying the source objects that you want to replicate.
     * You can choose to enable or disable the replication of these objects. Currently, Amazon S3 supports only the
     * filter that you can specify for objects created with server-side encryption using a customer master key (CMK)
     * stored in AWS Key Management Service (SSE-KMS).
     * 
     * **required:false**
     * @param sseKmsEncyptedReplication Specifies whether Amazon S3 replicates objects created with server-side
     * encryption using a customer master key (CMK) stored in AWS Key Management Service.
     * 
     * **maps:**`SourceSelectionCriteria.SseKmsEncryptedObjects.Status`
     */
    sseKmsEncyptedReplication(enabled:Field<"Enabled"|"Disabled">){
        this._.encryptedReplication=enabled
        return this
    }
    /**
     * **required:true**
     * @param bucket The Amazon Resource Name (ARN) of the bucket where you want Amazon S3 to store the results.
     * 
     * **maps:**`Destination.Bucket`
     * @param storageClass The storage class to use when replicating objects, such as standard or reduced redundancy. By 
     * default, Amazon S3 uses the storage class of the source object to create the object replica.
     * 
     * For valid values, see the StorageClass element of the PUT Bucket replication action in the Amazon Simple Storage 
     * Service API Reference.
     * 
     * **maps:**`Destination.StorageClass`
     */
    Destination(bucket:Attr<Bucket>,storageClass?:Field<StorageClassRep>){
        this._.bucket=Attr.get(bucket,"Arn")
        if(storageClass) this._.storageClass=storageClass
        return this
    }

    /**
     * **required:false**
     * @param owner Destination bucket owner account ID. In a cross-account scenario, if you direct Amazon S3 to change 
     * replica ownership to the AWS account that owns the destination bucket by specifying the AccessControlTranslation 
     * property, this is the account ID of the destination bucket owner. For more information, see Cross-Region Replication 
     * Additional Configuration: Change Replica Owner in the Amazon Simple Storage Service Developer Guide.
     * 
     * **maps:**`Destination.Account` | `Destination.AccessControlTranslation`
     */
    destinationOwner(owner:Field<string>){
        this._.destinationOwner=owner
        return this
    }
    /**
     * **required:false**
     * @param key Specifies the ID (Key ARN or Alias ARN) of the customer managed customer master key (CMK) stored in AWS Key 
     * Management Service (KMS) for the destination bucket. Amazon S3 uses this key to encrypt replica objects. Amazon S3 
     * only supports symmetric customer managed CMKs. For more information, see Using Symmetric and Asymmetric Keys in the 
     * AWS Key Management Service Developer Guide.
     * 
     * **maps:**`Destination.EncryptionConfiguration.ReplicaKmsKeyID`
     */
    destinationEncryption(key:Attr<"Arn">){
        this._.destinationKey=Attr.get(key,"Arn")
        return this
    }
    toJSON():ReplicationRuleOut {
        return {
            Id:this._.id,
            Prefix:this._.prefix,
            Status:this._.status ?? "Enabled",
            SourceSelectionCriteria:this._.encryptedReplication && {
                SseKmsEncryptedObjects:{
                    Status:this._.encryptedReplication
                }
            },
            Destination:{
                Bucket:this._.bucket,
                StorageClass:this._.storageClass,
                Account:this._.destinationOwner,
                AccessControlTranslation:this._.destinationOwner && {
                    Owner:"Destination"
                },
                EncryptionConfiguration:this._.destinationKey && {
                    ReplicaKmsKeyID:this._.destinationKey
                }
            }
        }
    }
    [checkValid](): SMap<ResourceError> {
        
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.id){
            errors.push("you must specify an id")
        }
        if(!this._.prefix){
            errors.push("you must specify a prefix")
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