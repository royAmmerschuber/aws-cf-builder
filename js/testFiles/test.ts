
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
export const importantInfo=Variable()
export const outs={
    one:Output<string>(),
    peter:{
        geiles:Output<number>(),
        randomInput:Variable<any[]>(),
        pentagon:aws.ApiGatewayRestApi()
            .name("petra")
    }
}