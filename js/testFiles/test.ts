
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