import * as parameter from "aws-cf-builder-core/generatables/parameter"
import * as custom from "aws-cf-builder-core/custom/resource"
import * as output from "aws-cf-builder-core/generatables/output"
import * as sub from "aws-cf-builder-core/fields/substitution"
import * as aws from "aws-cf-builder-defined-resources/aws"
import * as apigateway from "aws-cf-builder-defined-resources/apiGateway"
import * as lambda from "aws-cf-builder-defined-resources/lambda"
import * as iam from "aws-cf-builder-defined-resources/iam"
declare global{
    export const Parameter:typeof parameter.Parameter
    export const Output:typeof output.Output

    export const Sub:typeof sub.Sub

    export const Aws:typeof aws

    export const Custom:typeof custom.Custom

    export const ApiGateway:typeof apigateway
    export const Lambda:typeof lambda
    export const Iam:typeof iam
}