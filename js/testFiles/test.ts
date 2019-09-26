import { Output } from "../general/output"
import { Variable } from "../general/variable"

const aws=Custom("aws")
    .region("us-east-1")
    .resources
export const lambda=aws.LambdaFunction()
    .test("oazk")
    .code("s3:whatever.com")
    .role(aws.IamRole()
        .policy(JSON.stringify({
            statement:{Action:"log:*"}
        })).d.arn)
    .permission(aws.LambdaPermission()
        .Action("sts:invokeLambda")
        .FunctionName("test"))
export const peter="paul"
export const importantInfo=new Variable()
export const outs={
    one:new Output(),
    peter:{
        geiles:new Output(),
        randomInput:new Variable(),
        pentagon:aws.ApiGatewayRestApi()
            .name("petra")
    }
}