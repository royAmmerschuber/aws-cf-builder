
export const inp=new Parameter()
    .Type("String")
    .default("great stuff happening")
export const lambdaRole=new Custom.Iam.Role()
    .policy("test")
export const lambdas={
        one:new Custom.Lambda.Function()
            .codeUri(inp)
            .role(lambdaRole.a.Arn)
            .permission("main",new Custom.Lambda.Permission()
                .functionName(Custom.P.Lambda.Function.r)
                .Allow("apigateway"))
            .environment({variables:new Custom.B()
                .test("greatStuff")
                .bucketName("something.s3")}),
        runShit:new Custom.Lambda.Function()
            .codeUri("/test")
            .role(lambdaRole.a.Arn)
    }
export const out:any=new Output<any>()
   .Value(Sub`paul is great 
   ${lambdaRole.a.Arn} and here is a 
   ${"string"} and 
   ${42} and a ref
   ${lambdas.one.r}
   random object ${{paul:["perer","pan"]}}`)