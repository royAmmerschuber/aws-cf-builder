import { Output } from "aws-cf-builder-core/generatables/output"
import { Custom } from "aws-cf-builder-core/custom/resource"
import { Parameter } from "aws-cf-builder-core/generatables/parameter"
import { Sub } from "aws-cf-builder-core/fields/substitution"
import { Local } from "aws-cf-builder-core/fields/local"
import { Join } from "aws-cf-builder-core/fields/join"
import { Alias } from "aws-cf-builder-core/fields/alias"
import { Meta } from "aws-cf-builder-core/fields/meta"
import { JSONField } from "aws-cf-builder-core/fields/jsonField"
import * as aws from "aws-cf-builder-defined-resources/aws"
import * as apigateway from "aws-cf-builder-defined-resources/apiGateway"
import * as lambda from "aws-cf-builder-defined-resources/lambda"
import * as iam from "aws-cf-builder-defined-resources/iam"
import * as dynamoDb from "aws-cf-builder-defined-resources/dynamoDb"
import * as ssm from "aws-cf-builder-defined-resources/ssm"
import * as cloudwatch from "aws-cf-builder-defined-resources/cloudwatch"
import * as serverless from "aws-cf-builder-defined-resources/serverless"
import * as s3 from "aws-cf-builder-defined-resources/s3"
import * as sqs from "aws-cf-builder-defined-resources/sqs"
import * as ec2 from "aws-cf-builder-defined-resources/ec2"
import * as imageBuilder from "aws-cf-builder-defined-resources/imageBuilder"
import _ from "lodash"
//@ts-ignore
global.Parameter=Parameter
//@ts-ignore
global.Output=Output 
//@ts-ignore
global.Local=Local
//@ts-ignore
global.Sub=Sub
//@ts-ignore
global.Join=Join
//@ts-ignore
global.Alias=Alias
//@ts-ignore
global.Meta=Meta
//@ts-ignore
global.JSONField=JSONField

//@ts-ignore
global.Aws= aws

//@ts-ignore
global.Custom=Custom

//@ts-ignore
global.ApiGateway= apigateway
//@ts-ignore
global.Lambda= lambda
//@ts-ignore
global.Iam= iam
//@ts-ignore
global.DynamoDb= dynamoDb
//@ts-ignore
global.SSM=ssm
//@ts-ignore
global.CloudWatch=cloudwatch
//@ts-ignore
global.Serverless=serverless
//@ts-ignore
global.S3=s3
//@ts-ignore
global.SQS=sqs
//@ts-ignore
global.EC2=ec2
//@ts-ignore
global.ImageBuilder=imageBuilder

//@ts-ignore
global._=_
