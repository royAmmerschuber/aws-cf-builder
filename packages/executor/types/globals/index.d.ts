import * as parameter from "aws-cf-builder-core/generatables/parameter"
import * as custom from "aws-cf-builder-core/custom/resource"
import * as output from "aws-cf-builder-core/generatables/output"
import * as sub from "aws-cf-builder-core/fields/substitution"
import * as join from "aws-cf-builder-core/fields/join"
import * as alias from "aws-cf-builder-core/fields/alias"
import * as aws from "aws-cf-builder-defined-resources/aws"
import * as apigateway from "aws-cf-builder-defined-resources/apiGateway"
import * as lambda from "aws-cf-builder-defined-resources/lambda"
import * as iam from "aws-cf-builder-defined-resources/iam"
import * as dynamoDb from "aws-cf-builder-defined-resources/dynamoDb"
import * as ssm from "aws-cf-builder-defined-resources/ssm"
import * as cloudwatch from "aws-cf-builder-defined-resources/cloudwatch"
import * as serverless from "aws-cf-builder-defined-resources/serverless"
import * as local from "aws-cf-builder-core/fields/local"
import * as json from "aws-cf-builder-core/fields/jsonField"
import lodash from "lodash"
declare global{
    export const _:typeof lodash

    export const Parameter:typeof parameter.Parameter
    export const Output:typeof output.Output
    export const Sub:typeof sub.Sub
    export const Local:typeof local.Local
    export const Join:typeof join.Join
    export const Alias:typeof alias.Alias
    export const JSONField:typeof json.JSONField

    export const Custom:typeof custom.Custom

    export const Aws:typeof aws

    export const ApiGateway:typeof apigateway
    export const Lambda:typeof lambda
    export const Iam:typeof iam
    export const DynamoDb:typeof dynamoDb
    export const SSM:typeof ssm
    export const CloudWatch:typeof cloudwatch
    export const Serverless:typeof serverless
}