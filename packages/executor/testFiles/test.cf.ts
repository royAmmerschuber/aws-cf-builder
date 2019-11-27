export const api=new ApiGateway.Api()
    .name("test")
    .method("test",{
        GET:new ApiGateway.Method.Lambda()
            .Authorization("CUSTOM",new ApiGateway.Authorizer.Cognito("henry")
                .IdentitySource("karl")
                .Provider(new Parameter("providerName","String")))
            .Lambda(new Lambda.Function()
                .name("testFunc")
                .Code("s3://bucket/peter")
                .Role("randomArn")
                .Runtime("nodejs8.10"))
    })
    .deployment(
        new ApiGateway.Deployment("default",true)
            .description("the greatest deployment")
    )