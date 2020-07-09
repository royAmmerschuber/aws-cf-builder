
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
        .Schema({
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
        //full method
        GET: new ApiGateway.Method.Lambda()
            .Authorization("NONE")
            .Lambda("someLambdaArn")
            .requireApiKey()
            .response("200", {
                "application/json": new ApiGateway.Model("ni")
                    .Schema({})
                    .Type("application/json"),
                "differentResponse": "somethingRandom"
            })
            .requestModels("application/json",new ApiGateway.Model("san")
                .Schema({})
                .Type("application/json"))
            .requestModels({
                "some/thing":new ApiGateway.Model("yon")
                    .Schema({})
                    .Type("some/thing"),
                "other/form":"idAsString"
            })
            .requestParameters("header","paul",true)
            .requestParameters("querystring","paul",false)
            .requestParameters("path",{
                peter:true,
                pan:api2.r
            })
            .requestValidator(new ApiGateway.RequestValidator()
                .name("peter")
                .validateBody()
                .validateParameters(false))
            .operationName("launchLambda")
            .cacheParameters("some","random",api2.r)
            .cacheNamespace("thaNameS")
            .connection("VPC_LINK","vpc-someId")
            .contentHandling("CONVERT_TO_BINARY")
            .credentials("arn:aws:iam::*:user/*")
            .integrationResponse(
                //full response
                new ApiGateway.Method.IntegrationResponse()
                    .StatusCode("200")
                    .contentHandling("CONVERT_TO_BINARY")
                    .parameterMapping("paul","meier")
                    .parameterMapping({
                        klaus:"haus",
                        raus:"schlauch"
                    })
                    .templateMapping("application/json","some boring template")
                    .templateMapping({
                        "application/javascript":"yoyoyo",
                        "none":"nother text"
                    }),
                //empty response
                new ApiGateway.Method.IntegrationResponse()
                    .StatusCode("400"),
                {
                    StatusCode:"432",
                }
            )
            .passthrougBehavior("WHEN_NO_MATCH")
            .requestParameterMapping("dest","src")
            .requestParameterMapping({
                end:"start",
                to:"from"
            })
            .requestTemplateMapping("application/json","templ")
            .requestTemplateMapping({
                type:"t",
                "application/html":"<body/>"
            })
            .timeoutMs(1234),
        //empty & cog auth    
        DELETE: new ApiGateway.Method.Option({})
            .Authorization("COGNITO_USER_POOLS", new ApiGateway.Authorizer.Cognito("ni")
                .IdentitySource("auth")
                .Provider("someone"), [
                "one",
                "two"
            ]) ,
        //various different
        HEAD: new ApiGateway.Method.Option({})
            .requestValidator(new ApiGateway.RequestValidator())
            .connection("INTERNET")
            .credentials(new Iam.Role()
                .AssumePolicy("*")) ,
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

export const api3= new ApiGateway.Api()
    .body({
        Bucket: "bucket",
        Key: "path/key"
    })