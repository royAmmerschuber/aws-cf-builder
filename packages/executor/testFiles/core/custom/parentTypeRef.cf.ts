const auth=new Custom.Custom.Authorizer()
    .RestApi(Custom.P(ApiGateway.Api).r)
export const api=new ApiGateway.Api()
    .name("yolo")
    .method("some",{GET:new ApiGateway.Method.Lambda()
        .Authorization("CUSTOM",auth.r)
        .Lambda("some")})