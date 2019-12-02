import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

export const accountId=new ReferenceField("AWS::AccountId")
export const notificationARNs=new ReferenceField("AWS::NotificationARNs")
export const noValue=new ReferenceField("AWS::NoValue")
export const partition=new ReferenceField("AWS::Partition")
export const region=new ReferenceField("AWS::Region")
export const stackId=new ReferenceField("AWS::StackId")
export const stackName=new ReferenceField("AWS::StackName")
export const urlSuffix=new ReferenceField("AWS::URLSuffix")