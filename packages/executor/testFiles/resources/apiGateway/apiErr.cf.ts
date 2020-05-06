
export const api=new ApiGateway.Api()
    .method("test",{
        GET:new ApiGateway.Method.Lambda()
    })
export const api2=new ApiGateway.Api()
    .name("paul")
    .authorizer(new ApiGateway.Authorizer.Cognito("test"))
    .model(new ApiGateway.Model("paul"))
    .deployment(new ApiGateway.Deployment("default"))