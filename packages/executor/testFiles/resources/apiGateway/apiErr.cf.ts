
export const api=new ApiGateway.Api()
    .method("test",{
        GET:new ApiGateway.Method.Lambda()
            .timeoutMs(49),
        PATCH:new ApiGateway.Method.Lambda()
            .Authorization("NONE")
            .Lambda("placeholder")
            .timeoutMs(29_001)
            .integrationResponse(new ApiGateway.Method.IntegrationResponse())
    })
export const api2=new ApiGateway.Api()
    .name("paul")
    .authorizer(new ApiGateway.Authorizer.Cognito("test"))
    .model(new ApiGateway.Model("paul"))
    .deployment(new ApiGateway.Deployment("default"))