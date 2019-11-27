import { Output } from "aws-cf-builder-core/generatables/output"
import { Custom } from "aws-cf-builder-core/custom/resource"
import { Parameter } from "aws-cf-builder-core/generatables/parameter"
import { Sub } from "aws-cf-builder-core/fields/substitution"
import * as aws from "aws-cf-builder-defined-resources/aws"
import * as apigateway from "aws-cf-builder-defined-resources/apiGateway"
import * as lambda from "aws-cf-builder-defined-resources/lambda"
import * as iam from "aws-cf-builder-defined-resources/iam"
import * as dynamoDb from "aws-cf-builder-defined-resources/dynamoDb"
import * as ssm from "aws-cf-builder-defined-resources/ssm"
//@ts-ignore
global.Parameter=Parameter
//@ts-ignore
global.Output=Output 

//@ts-ignore
global.Sub=Sub

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