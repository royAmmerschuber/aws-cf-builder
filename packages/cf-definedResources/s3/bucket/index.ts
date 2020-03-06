import { Resource } from "aws-cf-builder-core/generatables/resource";
import { generateObject, resourceIdentifier, checkValid, checkCache, prepareQueue, stacktrace } from "aws-cf-builder-core/symbols"
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general"
import { notEmpty, callOnCheckValid, prepareQueueBase, callOnPrepareQueue, Ref } from "aws-cf-builder-core/util"
import { stackPreparable } from "aws-cf-builder-core/stackBackend"
import { pathItem } from "aws-cf-builder-core/path"
import { Field } from "aws-cf-builder-core/field"
import { Tag } from "../../util";
import { CorsRuleOut, CorsRule as _CorsRule } from "./corsRule";
import { LambdaNotificationOut, QueueNotificationOut, TopicNotificationOut, NotificationOut, Notification as _Notification } from "./notification";
import { LifecycleRuleOut, LifecycleRule as _LifecycleRule } from "./lifecycleRule";
import { AnalyticsConfigOut, AnalyticsConfig as _AnalyticsConfig } from "./analyticsConfig";
import _ from "lodash/fp"
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
/*
"BucketEncryption" : BucketEncryption,
"InventoryConfigurations" : [ InventoryConfiguration, ... ],
"MetricsConfigurations" : [ MetricsConfiguration, ... ],


"ReplicationConfiguration" : ReplicationConfiguration,
"WebsiteConfiguration" : WebsiteConfiguration
*/

export class Bucket extends Resource {
    readonly [resourceIdentifier] = "AWS::S3::Bucket";
    private _: {
        name: Field<string>
        tags: Tag[]
        accessControl: Field<string>
        corsRules: Field<CorsRuleOut>[]
        notifications: {
            Lambda: Field<NotificationOut>[]
            Queue: Field<NotificationOut>[]
            Topic: Field<NotificationOut>[]
        },
        lifecycleRules: Field<LifecycleRuleOut>[]
        accelerationStatus: Field<string>
        analyticsConfigs: Field<AnalyticsConfigOut>[]
        loggingConfig:{
            DestinationBucketName:Field<string>
            LogFilePrefix:Field<string>
        }
        lockConfig:{
            enabled:Field<boolean>
            mode:Field<string>
            time:Field<number>
            unit:"years"|"days"
        }
        publicAccessBlock:{[k in PublicAccessBlockConfigFlags]:Field<boolean>}
        versionStatus:Field<string>
    } = {
        tags: [],
        corsRules: [],
        notifications: {
            lambda: [],
            queue: [],
            topic: []
        },
        lifecycleRules: [],
        publicAccessBlock:{}
    } as any
    /**
     * returns the resource name.
     * Example: `mystack-mybucket-kdwwxmddtr2g`
     */
    r:ReferenceField

    a={
        /**
         * Returns the Amazon Resource Name (ARN) of the specified bucket.
         * 
         * Example: `arn:aws:s3:::mybucket`
         */
        Arn:new AttributeField(this,"Arn"),
        /**
         * Returns the IPv4 DNS name of the specified bucket.
         *
         * Example: `mystack-mybucket-kdwwxmddtr2g.s3.amazonaws.com`
         */
        DomainName:new AttributeField(this,"DomainName"),
        /**
         * Returns the IPv6 DNS name of the specified bucket.
         * 
         * Example: `mystack-mybucket-kdwwxmddtr2g.s3.dualstack.us-east-2.amazonaws.com`
         * 
         * For more information about dual-stack endpoints, see Using Amazon S3 Dual-Stack Endpoints.
         */
        DualStackDomainName:new AttributeField(this,"DualStackDomainName"),
        /**
         * Returns the regional domain name of the specified bucket.
         * 
         * Example: `mystack-mybucket-kdwwxmddtr2g.s3.us-east-2.amazonaws.com`
         */
        RegionalDomainName:new AttributeField(this,"RegionalDomainName"),
        /**
         * Returns the Amazon S3 website endpoint for the specified bucket.
         * 
         * Example (IPv4): `http://mystack-mybucket-kdwwxmddtr2g.s3-website-us-east-2.amazonaws.com/`
         * 
         * Example (IPv6): `http://mystack-mybucket-kdwwxmddtr2g.s3.dualstack.us-east-2.amazonaws.com/`
         */
        WebsiteURL:new AttributeField(this,"WebsiteURL")
    }
    constructor() {
        super(1)
    }
    /**
     * **required:false**
     * @param name A name for the bucket. If you don't specify a name, AWS CloudFormation generates a unique ID and 
     * uses that ID for the bucket name. For more information, see Name Type. The bucket name must contain only
     * lowercase letters, numbers, periods (.), and dashes (-).
     * 
     * > **Important!**
     * > If you specify a name, you can't perform updates that require replacement of this resource. You can perform
     * > updates that require no or some interruption. If you need to replace the resource, specify a new name.
     * 
     * **maps:**`BucketName`
     */
    name(name: Field<string>) {
        this._.name = name
        return this
    }

    /**
     * An arbitrary set of tags (key–value pairs) for this S3 Bucket.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
     * @param tags a map of tags
     */
    tag(tags: SMap<Field<string>>): this;
    /**
     * @param key the key of a new tag
     * @param value the value for the tag
     */
    tag(key: Field<string>, value: Field<string>): this;
    tag(tk: Field<string> | SMap<Field<string>>, value?: Field<string>): this {
        if (value != undefined) {
            this._.tags.push({
                Key: tk as Field<string>,
                Value: value
            });
        } else {
            for (const k in tk as SMap<Field<string>>) {
                this._.tags.push({
                    Key: k,
                    Value: tk[k]
                });
            }
        }
        return this;
    }

    /**
     * **required:false**
     * @param type A canned access control list (ACL) that grants predefined permissions to the bucket. For more information about
     * canned ACLs, see Canned ACL in the Amazon Simple Storage Service Developer Guide.
     * 
     * Be aware that the syntax for this property differs from the information provided in the Amazon Simple Storage Service
     * Developer Guide. The AccessControl property is case-sensitive and must be one of the following values: Private, PublicRead,
     * PublicReadWrite, AuthenticatedRead, LogDeliveryWrite, BucketOwnerRead, BucketOwnerFullControl, or AwsExecRead.
     * 
     * **maps:**`AccessControl`
     */
    accessControl(type: Field<AccessControl>) {
        this._.accessControl = type
        return this
    }

    /**
     * **required:false**
     * @param rules Describes the cross-origin access configuration for objects in an Amazon S3 bucket. For more information, see
     * Enabling Cross-Origin Resource Sharing in the Amazon Simple Storage Service Developer Guide.
     * 
     * **maps:**`CorsConfiguration.CorsRules`
     */
    corsRule(...rules: (Field<CorsRuleOut> | Bucket.CorsRule)[]) {
        this._.corsRules.push(...rules)
        return this
    }

    /**
     * Configuration that defines how Amazon S3 handles bucket notifications.
     * 
     * **required:false**
     * @param type the reciever of the notification
     * @param configs Describes the AWS Lambda functions to invoke and the events for which to invoke them.
     * 
     * **maps:**`NotificationConfiguration.LambdaConfigurations`
     */
    notificationConfig(type: "Lambda", configs: (Field<LambdaNotificationOut> | _Notification.Lambda)[]): this
    /**
     * Configuration that defines how Amazon S3 handles bucket notifications.
     * 
     * **required:false**
     * @param type the reciever of the notification
     * @param configs The Amazon Simple Queue Service queues to publish messages to and the events for which to publish messages.
     * 
     * **maps:**`NotificationConfiguration.QueueConfigurations`
     */
    notificationConfig(type: "Queue", configs: (Field<QueueNotificationOut> | _Notification.Queue)[]): this
    /**
     * Configuration that defines how Amazon S3 handles bucket notifications.
     * 
     * **required:false**
     * @param type the reciever of the notification
     * @param configs The topic to which notifications are sent and the events for which notifications are generated.
     * 
     * **maps:**`NotificationConfiguration.TopicConfigurations`
     */
    notificationConfig(type: "Topic", configs: (Field<TopicNotificationOut> | _Notification.Topic)[]): this
    /**
     * Configuration that defines how Amazon S3 handles bucket notifications.
     * 
     * **required:false**
     * @param notifications list of notification configurations
     * 
     * **maps:**`NotificationConfiguration.LambdaConfigurations | NotificationConfiguration.QueueConfigurations | NotificationConfiguration.TopicConfigurations`
     */
    notificationConfig(...notifications: (NotificationOut | Bucket.Notification)[]): this
    notificationConfig(...args: ["Lambda" | "Queue" | "Topic", (Field<NotificationOut> | Bucket.Notification)[]] | (NotificationOut | Bucket.Notification)[]): this {
        if (typeof args[0] == "string") {
            const [type, ...configs] = args
            this._.notifications[type].push(...configs as any)
        } else {
            (args as (NotificationOut | Bucket.Notification)[]).forEach(conf => {
                if (conf instanceof Resource) {
                    if (conf instanceof Bucket.Notification.Lambda) {
                        this._.notifications.Lambda.push(conf)
                    } else if (conf instanceof Bucket.Notification.Queue) {
                        this._.notifications.Queue.push(conf)
                    } else if (conf instanceof Bucket.Notification.Topic) {
                        this._.notifications.Topic.push(conf)
                    } else {
                        throw new PreparableError(this, "cannot automatically assign notification type. please use `.notificationConfig('Type',[...configs])`")
                    }
                } else if ("Function" in conf) {
                    this._.notifications.Lambda.push(conf)
                } else if ("Queue" in conf) {
                    this._.notifications.Queue.push(conf)
                } else if ("Topic" in conf) {
                    this._.notifications.Topic.push(conf)
                } else {
                    throw new PreparableError(this, "cannot automatically assign notification type. please use `.notificationConfig('Type',[...configs])`")
                }
            })
        }
        return this
    }
    /**
     * 
     * @param rules Specifies the lifecycle configuration for objects in an Amazon S3 bucket. For more information, see
     * Object Lifecycle Management in the Amazon Simple Storage Service Developer Guide.
     * 
     * **maps:**`LifecycleConfiguration.Rules`
     */
    lifecycleRule(...rules: (Field<LifecycleRuleOut> | Bucket.LifecycleRule)[]) {
        this._.lifecycleRules.push(...rules)
    }
    /**
     * Configures the transfer acceleration state for an Amazon S3 bucket. For more information, see Amazon S3 Transfer
     * Acceleration in the Amazon Simple Storage Service Developer Guide.
     * 
     * **required:false**
     * @param status Specifies the transfer acceleration status of the bucket.
     * 
     * **maps:**`AccelerationConfiguration.AccelerationStatus`
     */
    accelerateConfig(status: Field<"Enabled" | "Suspended">) {
        this._.accelerationStatus = status
        return this
    }

    /**
     * **required:false**
     * @param configs Specifies the configuration and any analyses for the analytics filter of an Amazon S3 bucket.
     * 
     * **maps:**`AnalyticsConfigurations`
     */
    analyticsConfig(...configs: (Field<AnalyticsConfigOut> | Bucket.AnalyticsConfig)[]){
        this._.analyticsConfigs.push(...configs)
        return this
    }

    /**
     * Settings that define where logs are stored.
     * 
     * **required:false**
     * @param destinationBucket The name of the bucket where Amazon S3 should store server access log files. You can
     * store log files in any bucket that you own. By default, logs are stored in the bucket where the
     * LoggingConfiguration property is defined.
     * 
     * **maps:**`LoggingConfiguration.DestinationBucketName`
     * @param filePrefix A prefix for all log object keys. If you store log files from multiple Amazon S3 buckets in a
     * single bucket, you can use a prefix to distinguish which log files came from which bucket.
     * 
     * **maps:**`LoggingConfiguration.LogFilePrefix
     */
    loggingConfig(destinationBucket:Ref<Bucket>,filePrefix?:Field<string>){
        this._.loggingConfig={
            DestinationBucketName:Ref.get(destinationBucket),
            LogFilePrefix:filePrefix
        }
        return this
    }
    /**
     * Places an Object Lock configuration on the specified bucket. The rule specified in the Object Lock configuration
     * will be applied by default to every new object placed in the specified bucket.
     * 
     * **required:false**
     * @param enabled Indicates whether this bucket has an Object Lock configuration enabled.
     * 
     * **maps:**`ObjectLockEnabled`
     * @param mode The default Object Lock retention mode you want to apply to new objects placed in the specified bucket.
     * 
     * **maps:**`ObjectLockConfiguration.Rule.DefaultRetention.Mode`
     * @param time The number of days or years that you want to specify for the default retention period.
     * 
     * **maps:**`ObjectLockConfiguration.Rule.DefaultRetention.Days | ObjectLockConfiguration.Rule.DefaultRetention.Years`
     * @param unit if you want to specify the retention period in years or days
     */
    objectLockConfig(enabled:Field<boolean>,mode:Field<"COMPLIANCE"|"GOVERNANCE">,time:Field<number>,unit:"years"|"days"){
        this._.lockConfig={
            enabled,
            mode,
            time,
            unit
        }
        return this
    }
    /**
     * **required:false**
     * @param flags Configuration that defines how Amazon S3 handles public access.
     * 
     * ### blockPublicAcls
     * Specifies whether Amazon S3 should block public access control lists (ACLs) for this bucket and objects in this
     * bucket. Setting this element to TRUE causes the following behavior:
     * - PUT Bucket acl and PUT Object acl calls fail if the specified ACL is public.
     * - PUT Object calls fail if the request includes a public ACL.
     * - PUT Bucket calls fail if the request includes a public ACL.
     * 
     * Enabling this setting doesn't affect existing policies or ACLs.
     * ### BlockPublicPolicy
     * Specifies whether Amazon S3 should block public bucket policies for this bucket. Setting this element to TRUE causes
     * Amazon S3 to reject calls to PUT Bucket policy if the specified bucket policy allows public access.
     * 
     * Enabling this setting doesn't affect existing bucket policies.
     * ### IgnorePublicAcls
     * Specifies whether Amazon S3 should ignore public ACLs for this bucket and objects in this bucket. Setting this element
     * to TRUE causes Amazon S3 to ignore all public ACLs on this bucket and objects in this bucket.
     * 
     * Enabling this setting doesn't affect the persistence of any existing ACLs and doesn't prevent new public ACLs from being set.
     * ### RestrictPublicBuckets
     * Specifies whether Amazon S3 should restrict public bucket policies for this bucket. Setting this element to TRUE restricts
     * access to this bucket to only AWS services and authorized users within this account if the bucket has a public policy.
     * 
     * Enabling this setting doesn't affect previously stored bucket policies, except that public and cross-account access within any
     * public bucket policy, including non-public delegation to specific accounts, is blocked.
     * 
     * **maps:**`PublicAccessBlockConfiguration`
     */
    publicAccessBlockConfig(flags:{[k in PublicAccessBlockConfigFlags]:Field<boolean>}):this
    publicAccessBlockConfig(...flags:PublicAccessBlockConfigFlags[]):this
    publicAccessBlockConfig(f:{[k in PublicAccessBlockConfigFlags]:Field<boolean>}|PublicAccessBlockConfigFlags,...flags:PublicAccessBlockConfigFlags[]){
        if(typeof f=="string"){
            [f,...flags].forEach(f => this._.publicAccessBlock[f]=true)
        }else{
            this._.publicAccessBlock=_.assign(f,this._.publicAccessBlock)
        }
        return this
    }
    /**
     * Enables multiple versions of all objects in this bucket. You might enable versioning to prevent objects from being
     * deleted or overwritten by mistake or to archive objects so that you can retrieve previous versions of them.
     * 
     * **required:false**
     * @param status The versioning state of the bucket.
     * 
     * **maps:**`VersioningConfiguration.Status`
     */
    versioningConfig(status:Field<"Enabled"|"Suspended">){
        this._.versionStatus=status
        return this
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]

        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors: errors
            };
        }

        return this[checkCache] = callOnCheckValid(this._, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if (prepareQueueBase(stack, path, ref, this)) {
            callOnPrepareQueue(this._, stack, this, true)
        }
    }
    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: {
                BucketName: this._.name,
                Tags: notEmpty(this._.tags),
                AccessControl: this._.accessControl,
                CorsConfiguration: this._.corsRules.length ? {
                    CorsRules: this._.corsRules
                } : undefined,
                NotificationConfiguration: this._.notifications.Lambda.length || this._.notifications.Queue.length || this._.notifications.Topic.length ? {
                    LambdaConfigurations: notEmpty(this._.notifications.Lambda),
                    QueueConfigurations: notEmpty(this._.notifications.Queue),
                    TopicConfigurations: notEmpty(this._.notifications.Topic)
                } : undefined,
                LifecycleConfiguration: this._.lifecycleRules.length ? {
                    Rules: this._.lifecycleRules
                } : undefined,
                AccelerateConfiguration: this._.accelerationStatus && {
                    AccelerationStatus: this._.accelerationStatus
                },
                AnalyticsConfigurations: notEmpty(this._.analyticsConfigs),
                LoggingConfiguration:this._.loggingConfig,
                ObjectLockConfiguration: this._.lockConfig && {
                    Rule:{
                        DefaultRetention:{
                            [this._.lockConfig.unit== "years" ? "Years" : "Days"]:this._.lockConfig.time,
                            Mode:this._.lockConfig.mode
                        }
                    }
                },
                ObjectLockEnabled: this._.lockConfig && this._.lockConfig.enabled,
                PublicAccessBlockConfiguration: _.size(this._.publicAccessBlock) ? {
                    BlockPublicAcls:this._.publicAccessBlock.blockPublicAcls,
                    BlockPublicPolicy:this._.publicAccessBlock.blockPublicPolicy,
                    IgnorePublicAcls:this._.publicAccessBlock.ignorePublicAcls,
                    RestrictPublicBuckets:this._.publicAccessBlock.restrictPublicBuckets
                } : undefined,
                VersioningConfiguration: this._.versionStatus && {
                    Status:this._.versionStatus
                }
            }
        }
    }
}
export namespace Bucket {
    export const CorsRule = _CorsRule
    export type CorsRule = _CorsRule

    export const Notification = _Notification
    export type Notification = _Notification

    export const LifecycleRule = _LifecycleRule
    export type LifecycleRule = _LifecycleRule

    export const AnalyticsConfig = _AnalyticsConfig
    export type AnalyticsConfig = _AnalyticsConfig
}

export type AccessControl =
    "Private" |
    "PublicRead" |
    "PublicReadWrite" |
    "AuthenticatedRead" |
    "LogDeliveryWrite" |
    "BucketOwnerRead" |
    "BucketOwnerFullControl" |
    "AwsExecRead"
export type PublicAccessBlockConfigFlags=
    "blockPublicAcls" |
    "blockPublicPolicy" |
    "ignorePublicAcls" |
    "restrictPublicBuckets" 