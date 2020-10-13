import { Resource } from "aws-cf-builder-core/generatables/resource";
import { generateObject, resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, Generatable } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { callOnPrepareQueue, Attr, notEmpty, callOnCheckValid, prepareQueueBase } from "aws-cf-builder-core/util";
import { Field } from "aws-cf-builder-core/field";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { Tag } from "../util";
import { QueuePolicy } from "./queuePolicy";
import { PolicyOut, PolicyDocument } from "../iam/policy/policyDocument";

export class Queue extends Resource {
    [resourceIdentifier] = "AWS::SQS::Queue"
    private _: {
        name: Field<string>
        contentDedup: Field<boolean>
        fifo: Field<boolean>
        delay: Field<number>
        kms: {
            key: Field<string>
            reusePeriod: Field<number>
        }
        maxMessageSize: Field<number>
        messageRetentionPeriod: Field<number>
        tags: Tag[]
        redrivePolicy: {
            deadLetterTargetArn: Field<string>
            maxReceiveCount: Field<number>
        }
        receiveMessageWaitTime: Field<number>
        visibilityTimeout: Field<number>
    } = {
        tags: []
    } as any
    private policies = new Set<QueuePolicy>()
    /**
     * the queue URL. For example: `https://sqs.us-east-2.amazonaws.com/123456789012/ab1-MyQueue-A2BCDEF3GHI4`
     */
    r: ReferenceField
    a = {
        /**
         * the Amazon Resource Name (ARN) of the queue. For example: `arn:aws:sqs:us-east-2:123456789012:mystack-myqueue-15PG5C2FC1CW8`.
         */
        Arn: new AttributeField(this, "Arn"),
        /**
         * the queue name. For example: mystack-myqueue-1VF9BKQH5BJVI.
         */
        QueueName: new AttributeField(this, "QueueName")
    }
    constructor() { super(1) }
    /**
     * **required:false**
     * @param name A name for the queue. To create a FIFO queue, the name of your FIFO queue must end with the .fifo suffix. For more
     * information, see FIFO (First-In-First-Out) Queues in the Amazon Simple Queue Service Developer Guide.
     * 
     * If you don't specify a name, AWS CloudFormation generates a unique physical ID and uses that ID for the queue name. For more
     * information, see Name Type in the AWS CloudFormation User Guide.
     * 
     * > **Important**
     * > 
     * > If you specify a name, you can't perform updates that require replacement of this resource. You can perform updates that require
     * > no or some interruption. If you must replace the resource, specify a new name.
     * 
     * **maps:**`QueueName`
     */
    name(name: Field<string>) {
        this._.name = name
        return this
    }
    /**
     * **required:false**
     * @param name For first-in-first-out (FIFO) queues, specifies whether to enable content-based deduplication. During the
     * deduplication interval, Amazon SQS treats messages that are sent with identical content as duplicates and delivers only one
     * copy of the message. For more information, see the ContentBasedDeduplication attribute for the CreateQueue action in the Amazon
     * Simple Queue Service API Reference.
     * 
     * **maps:**`ContentBasedDeduplication`
     */
    contentBasedDeduplication(bool: Field<boolean> = true) {
        this._.contentDedup = bool
        return this
    }
    /**
     * **required:false**
     * @param sec The time in seconds for which the delivery of all messages in the queue is delayed. You can specify an integer value 
     * of 0 to 900 (15 minutes). The default value is 0.
     * 
     * **maps:**`DelaySeconds`
     */
    delaySeconds(sec: Field<number>) {
        this._.delay = sec
        return this
    }
    /**
     * **required:false**
     * @param bool If set to true, creates a FIFO queue. If you don't specify this property, Amazon SQS creates a standard queue. For 
     * more information, see FIFO (First-In-First-Out) Queues in the Amazon Simple Queue Service Developer Guide
     * 
     * **maps:**`FifoQueue`
     */
    fifoQueue(bool: Field<boolean> = true) {
        this._.fifo = bool
        return this
    }
    /**
     * **required:false**
     * @param keyId  The ID of an AWS managed customer master key (CMK) for Amazon SQS or a custom CMK. To use the AWS managed CMK for 
     * Amazon SQS, specify the (default) alias alias/aws/sqs. For more information, see the following:
     * - Protecting Data Using Server-Side Encryption (SSE) and AWS KMS in the Amazon Simple Queue Service Developer Guide
     * - CreateQueue in the Amazon Simple Queue Service API Reference
     * - The Customer Master Keys section of the AWS Key Management Service Best Practices whitepaper
     * 
     * **maps:**`KmsMasterKeyId`
     * @param reusePeriodSec The length of time in seconds for which Amazon SQS can reuse a data key to encrypt or decrypt messages before
     * calling AWS KMS again. The value must be an integer between 60 (1 minute) and 86,400 (24 hours). The default is 300 (5 minutes).
     * > **Note**
     * > 
     * > A shorter time period provides better security, but results in more calls to AWS KMS, which might incur charges after Free Tier. 
     * > For more information, see How Does the Data Key Reuse Period Work? in the Amazon Simple Queue Service Developer Guide.
     * 
     * **maps:**`KmsDataKeyReusePeriodSeconds`
     */
    kmsMasterKey(id: Attr<"KeyId">, reusePeriodSec?: Field<number>) {//TODO KMS
        this._.kms = {
            key: Attr.get(id,"KeyId"),
            reusePeriod: reusePeriodSec
        }
        return this
    }
    /**
     * **required:false**
     * @param bytes  The limit of how many bytes that a message can contain before Amazon SQS rejects it. You can specify an integer 
     * value from 1,024 bytes (1 KiB) to 262,144 bytes (256 KiB). The default value is 262,144 (256 KiB).
     * 
     * **maps:**`MaximumMessageSize`
     */
    maximumMessageSize(bytes: Field<number>) {
        this._.maxMessageSize = bytes
        return this
    }
    /**
     * **required:false**
     * @param sec The number of seconds that Amazon SQS retains a message. You can specify an integer value from 60 seconds (1 minute) 
     * to 1,209,600 seconds (14 days). The default value is 345,600 seconds (4 days).
     * 
     * **maps:**`MessageRetentionPeriod `
     */
    messageRetentionPeriod(sec: Field<number>) {
        this._.messageRetentionPeriod = sec
        return this
    }
    /**
     * **required:false**
     * @param sec Specifies the duration, in seconds, that the ReceiveMessage action call waits until a message is in the queue in order 
     * to include it in the response, rather than returning an empty response if a message isn't yet available. You can specify an integer 
     * from 1 to 20. Short polling is used as the default or when you specify 0 for this property. For more information, see Amazon SQS 
     * Long Poll.
     * 
     * **maps:**`ReceiveMessageWaitTimeSeconds`
     */
    receiveMessageWaitTime(sec: Field<number>) {
        this._.receiveMessageWaitTime = sec
        return this
    }
    /**
     * **required:false**
     * @param deadLetterQueue The Amazon Resource Name (ARN) of the dead-letter queue to which Amazon SQS moves messages after the value 
     * of maxReceiveCount is exceeded.
     * 
     * **maps:**`RedrivePolicy.deadLetterTargetArn`
     * @param maxReceiveCount The number of times a message is delivered to the source queue before being moved to the dead-letter queue.
     * 
     * **maps:**`RedrivePolicy.maxReceiveCount`
     */
    redrivePolicy(deadLetterQueue: Attr<Queue>, maxReceiveCount: Field<number>) {
        this._.redrivePolicy = {
            deadLetterTargetArn: Attr.get(deadLetterQueue, "Arn"),
            maxReceiveCount
        }
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
     * @param sec The length of time during which a message will be unavailable after a message is delivered from the queue. This blocks other 
     * components from receiving the same message and gives the initial component time to process and delete the message from the queue.
     * Values must be from 0 to 43,200 seconds (12 hours). If you don't specify a value, AWS CloudFormation uses the default value of 30 seconds.
     * For more information about Amazon SQS queue visibility timeouts, see Visibility Timeout in the Amazon Simple Queue Service Developer Guide.
     * 
     * **maps:**`VisibilityTimeout`
     */
    visibilityTimeout(sec: Field<number>) {
        this._.visibilityTimeout = sec
        return this
    }
    /**
     * **required:false**
     * @param policies Queue policies to attach to this resource
     */
    policy(...policies: (QueuePolicy | Field<PolicyOut> | PolicyDocument)[]) {
        policies.forEach(p => {
            if (p instanceof QueuePolicy) {
                this.policies.add(p)
            } else {
                this.policies.add(new QueuePolicy()
                    .Document(p))
            }
        })
        return this
    }
    [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: {
                ContentBasedDeduplication: this._.contentDedup,
                DelaySeconds: this._.delay,
                FifoQueue: this._.fifo,
                KmsDataKeyReusePeriodSeconds: this._.kms?.reusePeriod,
                KmsMasterKeyId: this._.kms?.key,
                MaximumMessageSize: this._.maxMessageSize,
                MessageRetentionPeriod: this._.messageRetentionPeriod,
                QueueName: this._.name,
                ReceiveMessageWaitTimeSeconds: this._.receiveMessageWaitTime,
                RedrivePolicy: this._.redrivePolicy,
                Tags: notEmpty(this._.tags),
                VisibilityTimeout: this._.visibilityTimeout
            }
        }
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (
            this._.delay != undefined && !(this._.delay instanceof Generatable) &&
            (this._.delay < 0 || this._.delay > 900)
        ) {
            errors.push("the delay must be between 0 and 900 Seconds")
        }
        if (
            this._.kms?.reusePeriod != undefined && !(this._.kms.reusePeriod instanceof Generatable) &&
            (this._.kms.reusePeriod < 60 || this._.kms.reusePeriod > 86_400)
        ) {
            errors.push("the kms reusePeriod must be between 60 and 86'400 seconds")
        }
        if (
            this._.maxMessageSize != undefined && !(this._.maxMessageSize instanceof Generatable) &&
            (this._.maxMessageSize < 1024 || this._.maxMessageSize > 262_144)
        ) {
            errors.push("the maxMessageSize must be between 1'024 and 262'144 bytes")
        }
        if (
            this._.messageRetentionPeriod != undefined && !(this._.messageRetentionPeriod instanceof Generatable) &&
            (this._.messageRetentionPeriod < 60 || this._.messageRetentionPeriod > 1_209_600)
        ) {
            errors.push("the messageRetentionPeriod must be between 60 and 1'209'600 seconds")
        }

        if (
            this._.receiveMessageWaitTime != undefined && !(this._.receiveMessageWaitTime instanceof Generatable) &&
            (this._.receiveMessageWaitTime < 0 || this._.receiveMessageWaitTime > 20)
        ) {
            errors.push("the receiveMessageWaitTime must be between 0 and 20 seconds")
        }

        if (
            this._.visibilityTimeout != undefined && !(this._.visibilityTimeout instanceof Generatable) &&
            (this._.visibilityTimeout < 0 || this._.visibilityTimeout > 43_200)
        ) {
            errors.push("the visibilityTimeout must be between 0 and 43'200 seconds")
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache] = callOnCheckValid([
            this._,
            this.policies
        ], out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean) {
        if (prepareQueueBase(stack, path, ref, this)) {
            callOnPrepareQueue(this._, stack, path, true)
            callOnPrepareQueue(this.policies, stack, this, false)
        }
    }

}