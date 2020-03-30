import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, stacktrace, checkCache } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { callOnPrepareQueue, callOnCheckValid, Attr } from "aws-cf-builder-core/util";
import { LambdaFunction } from "../../lambda/function";

interface baseNotificationOut{
    Event:Field<string>,
    Filter?:{S3Key:{
        Rules:{
            Name:Field<string>
            Value:Field<string>
        }[]
    }}
}
export interface LambdaNotificationOut extends baseNotificationOut{
    Function:Field<string>
}
export interface QueueNotificationOut extends baseNotificationOut{
    Queue:Field<string>
}
export interface TopicNotificationOut extends baseNotificationOut{
    Topic:Field<string>
}
export type NotificationOut=LambdaNotificationOut|QueueNotificationOut|TopicNotificationOut
export type KeyFilterType="suffix"|"prefix"
export type S3Event=
    "s3:ObjectCreated:*" |
    "s3:ObjectCreated:Put" |
    "s3:ObjectCreated:Post" |
    "s3:ObjectCreated:Copy" |
    "s3:ObjectCreated:CompleteMultipartUpload" |


    "s3:ObjectRemoved:*" |
    "s3:ObjectRemoved:Delete" |
    "s3:ObjectRemoved:DeleteMarkerCreated" |

    "s3:ObjectRestore:Post" |
    "s3:ObjectRestore:Completed" |

    "s3:ReducedRedundancyLostObject" |

    "s3:Replication:OperationFailedReplication" |
    "s3:Replication:OperationMissedThreshold" |
    "s3:Replication:OperationReplicatedAfterThreshold" |
    "s3:Replication:OperationNotTracked"
export abstract class Notification extends InlineAdvField<NotificationOut>{
    protected _:{
        event:Field<string>
        keyFilters:{
            Name:Field<string>,
            Value:Field<string>
        }[]
    }={
        keyFilters:[]
    } as any
    constructor(){
        super(2)
    }
    /**
     * **required:true**
     * @param event The Amazon S3 bucket event for which to invoke the AWS Lambda function. For more information, see
     * Supported Event Types in the Amazon Simple Storage Service Developer Guide.
     * 
     * **maps:**`Event`
     */
    Event(event:Field<S3Event>){
        this._.event=event
        return this
    }
    /**
     * **required:false**
     * @param type The object key name prefix or suffix identifying one or more objects to which the filtering rule
     * applies. The maximum length is 1,024 characters. Overlapping prefixes and suffixes are not supported. For more
     * information, see Configuring Event Notifications in the Amazon Simple Storage Service Developer Guide.
     * 
     * **maps:**`Filter.S3Key.Rules[].Name`
     * @param fix The value that the filter searches for in object key names.
     * 
     * **maps:**`Filter.S3Key.Rules[].Value`
     */
    keyFilter(type:Field<KeyFilterType>,fix:Field<string>){
        this._.keyFilters.push({
            Name:type,
            Value:fix
        })
        return this
    }
    toJSON():NotificationOut {
        return {
            Event:this._.event,
            Filter:this._.keyFilters.length
                ? { S3Key:{
                    Rules:this._.keyFilters
                } }
                : undefined,
        } as any
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.event){
            errors.push("you mus specify an event")
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
export namespace Notification{
    export class Lambda extends Notification{
        readonly [resourceIdentifier]="LambdaNotification"
        protected _:Notification["_"] & {
            function:Field<string>
        }
        /**
         * **required:true**
         * @param lambda The Amazon Resource Name (ARN) of the AWS Lambda function that Amazon S3 invokes when
         * the specified event type occurs.
         * 
         * **maps:`Function`
         */
        Function(lambda:Attr<LambdaFunction>){
            this._.function=Attr.get(lambda,"Arn")
            return this
        }
        toJSON():LambdaNotificationOut {
            const out:any=super.toJSON()
            out.Function=this._.function
            return out
        }        
        [checkValid](): SMap<ResourceError> {
            const out=super[checkValid]()
            const errors:string[]=[]
            if(!this._.function){
                errors.push("you must specify a function")
            }
            if(errors.length){
                if(this[stacktrace] in out){
                    out[this[stacktrace]].errors.push(...errors)
                }else{
                    out[this[stacktrace]]={
                        type:this[resourceIdentifier],
                        errors
                    }
                }
            }
            return out
        }
    }
    export class Queue extends Notification{
        readonly [resourceIdentifier]="QueueNotification"
        protected _:Notification["_"] & {
            queue:Field<string>
        }
        /**
         * **required:true**
         * @param queue The Amazon Resource Name (ARN) of the Amazon SQS queue to which Amazon S3 publishes a
         * message when it detects events of the specified type.
         * 
         * **maps:**`Queue`
         */
        Queue(queue:Attr<"Arn">){
            this._.queue=Attr.get(queue,"Arn")
            return this
        }
        toJSON():QueueNotificationOut {
            const out:any=super.toJSON()
            out.Queue=this._.queue
            return out
        }        
        [checkValid](): SMap<ResourceError> {
            const out=super[checkValid]()
            const errors:string[]=[]
            if(!this._.queue){
                errors.push("you must specify a queue")
            }
            if(errors.length){
                if(this[stacktrace] in out){
                    out[this[stacktrace]].errors.push(...errors)
                }else{
                    out[this[stacktrace]]={
                        type:this[resourceIdentifier],
                        errors
                    }
                }
            }
            return out
        }
    }
    export class Topic extends Notification{
        readonly [resourceIdentifier]="TopicNotification"
        protected _:Notification["_"] & {
            topic:Field<string>
        }
        /**
         * **required:true**
         * @param topic The Amazon Resource Name (ARN) of the Amazon SNS topic to which Amazon S3 publishes a
         * message when it detects events of the specified type.
         * 
         * **maps:**`Topic`
         */
        Topic(topic:Attr<"Arn">){
            this._.topic=Attr.get(topic,"Arn")
            return this
        }
        toJSON():QueueNotificationOut {
            const out:any=super.toJSON()
            out.Topic=this._.topic
            return out
        }        
        [checkValid](): SMap<ResourceError> {
            const out=super[checkValid]()
            const errors:string[]=[]
            if(!this._.topic){
                errors.push("you must specify a topic")
            }
            if(errors.length){
                if(this[stacktrace] in out){
                    out[this[stacktrace]].errors.push(...errors)
                }else{
                    out[this[stacktrace]]={
                        type:this[resourceIdentifier],
                        errors
                    }
                }
            }
            return out
        }
    }
}