export const api = new ApiGateway.Api()
    .apiKeySourceType("AUTHORIZER")
    .binaryMediaTypes("x", "y", "z")
    .body({ openapi:"some openapi" }) //
    .description("bla bla bla")
    .endpointConfiguration("EDGE", "REGIONAL")
    .failOnWarnings()
    .name("wierdApi")
    .policy(new Iam.Policy.Document()
        .Statement(new Iam.Policy.Statement()
            .Actions("*")))
    .model(new ApiGateway.Model("ichi", true)
        .Type("application/json")
        .Shema({
            thisIsASchema: "man!"
        })
        .description("epic model"))
    .deployment(new ApiGateway.Deployment("dpl")
        .canarySettings({
            PercentTraffic: 4
        })
        .description("aws-some")
        .stageDescription({
            AccessLogSetting: {
                DestinationArn: "arn:bla"
            }
        }))
    .authorizer(new ApiGateway.Authorizer.Cognito("cog")
        .IdentitySource("secret")
        .Provider("arn:userpool")
        .ttl(4))
    .method("paul/meier", {
        GET: new ApiGateway.Method.Lambda()
            .Authorization("NONE")
            .Lambda("someLambdaArn")
            .requireApiKey()
            .response("200", {
                "application/json": new ApiGateway.Model("ni")
                    .Shema({})
                    .Type("application/json")
            })
            .operationName("launchLambda"),
        DELETE: new ApiGateway.Method.Option({})
            .Authorization("COGNITO_USER_POOLS", new ApiGateway.Authorizer.Cognito("ni")
                .IdentitySource("auth")
                .Provider("someone"), [
                "one",
                "two"
            ]),
        HEAD: new ApiGateway.Method.Option({}),
        PATCH: new ApiGateway.Method.Option({}),
        POST: new ApiGateway.Method.Option({}),
        PUT: new ApiGateway.Method.Option({}),
        branch: {
            customOption: {
                OPTIONS: new ApiGateway.Method.Option({}, "sweden")
            },
            noOptions: {
                PUT: new ApiGateway.Method.Lambda()
                    .Authorization("AWS_IAM")
                    .Lambda("ni"),
                OPTIONS: null
            }
        }
    })
    .method("paul", {
        PUT: new ApiGateway.Method.Lambda()
            .Authorization("NONE")
            .Lambda("some")
    })

export const api2 = new ApiGateway.Api()
    .body("s3://bucket/path/key:version", "tag")
    .optionsMethodGenerator(node => new ApiGateway.Method.Lambda()
        .Authorization("NONE")
        .Lambda("paul"))
    .method("meier",{
        GET:new ApiGateway.Method.Lambda()
            .Authorization("NONE")
            .Lambda("san")
    })
export const api3= new ApiGateway.Api()
    .body({
        Bucket: "bucket",
        Key: "path/key"
    })