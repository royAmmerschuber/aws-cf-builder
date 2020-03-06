import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { SMap, ResourceError } from "aws-cf-builder-core/general";

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
//TODO
export type Notification=Notification.Lambda|Notification.Queue|Notification.Topic
export namespace Notification{
    export class Lambda extends InlineAdvField<LambdaNotificationOut>{
        readonly [resourceIdentifier]="LambdaNotification"
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
    export class Queue extends InlineAdvField<QueueNotificationOut>{
        readonly [resourceIdentifier]="QueueNotification"
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
    export class Topic extends InlineAdvField<TopicNotificationOut>{
        readonly [resourceIdentifier]="TopicNotification"
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
}