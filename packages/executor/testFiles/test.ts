const aws=new Custom("aws")
    .region("us-east-1")
    .resources
export const inp=new Variable<string>()
    .type("string")
    .default("great stuff happening")
export const lambdaRole=new aws.IamRole()
    .policy("test")

export const lambda=new aws.LambdaFunction()
    .codeUri(inp)
    .role(lambdaRole.d.arn)
    .permission(new aws.LambdaPermission()
        .functionName(Custom.P.aws_lambda_function.function_name)
        .Allow("apigateway"))
    .environment({variables:new Custom.B()
        .test("greatStuff")
        .bucketName("something.s3")})
export const lambdaRunShit=new aws.LambdaFunction()
    .codeUri("/test")
    .role(lambdaRole.d.arn)
export const out=new Output()
   .value(lambda.d.environment.variable.test)
   .sensitive()
/*
const aws=new Custom("aws"){
    region:"us-east-1"
}.resources
export const inp=new Variable<string>(){
    type:"string"
    default:"great stuff happening"
}
export const lambdaRole=new aws.IamRole(){
    policy:"test"
}

export const lambda=new aws.LambdaFunction(){
    codeUri:inp
    role:lambdaRole.d.arn
    permission:new aws.LambdaPermission(){
        Allow:"apigateway"
    }
    environment:{variables:new Custom.B(){
        test:"greatStuff"
    }}
}
export const lambdaRunShit=new aws.LambdaFunction(){
    codeUri:"/test"
    role:lambdaRole.d.arn
}
export const out=(()=>new Output()
   .value(lambda.d.environment.variable.test)
   .sensitive())()

*/