import { Field } from "aws-cf-builder-core/field";

export type EventOut=
    EventOut.S3 |
    EventOut.SNS |
    EventOut.Kinesis |
    EventOut.DynamoDB |
    EventOut.SQS |
    EventOut.Api |
    EventOut.Schedule |
    EventOut.CloudWatchEvent |
    EventOut.CloudWatchLogs |
    EventOut.IoTRule |
    EventOut.AlexaSkill |
    EventOut.Cognito
export namespace EventOut{
    export interface S3{
        Properties:{}
        Type:Field<"S3">
    }
    export interface SNS{
        Properties:{}
        Type:Field<"SNS">
    }
    export interface Kinesis{
        Properties:{}
        Type:Field<"Kinesis">
    }
    export interface DynamoDB{
        Properties:{}
        Type:Field<"DynamoDB">
    }
    export interface SQS{
        Properties:{}
        Type:Field<"SQS">
    }
    export interface Api{
        Properties:{}
        Type:Field<"Api">
    }
    export interface Schedule{
        Properties:{}
        Type:Field<"Schedule">
    }
    export interface CloudWatchEvent{
        Properties:{}
        Type:Field<"CloudWatchEvent">
    }
    export interface CloudWatchLogs{
        Properties:{}
        Type:Field<"CloudWatchLogs">
    }
    export interface IoTRule{
        Properties:{}
        Type:Field<"IoTRule">
    }
    export interface AlexaSkill{
        Properties:{}
        Type:Field<"AlexaSkill">
    }
    export interface Cognito{
        Properties:{}
        Type:Field<"Cognito">
    }
}
export namespace Event{
    //TODO Event
}