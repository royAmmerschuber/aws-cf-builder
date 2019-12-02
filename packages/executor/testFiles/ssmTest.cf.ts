export const param=new SSM.Parameter()
    .Type("String")
    .Value("this is a test")
    .allowedPattern(/paul/)
    .policies(JSON.stringify([
        {random:"data"}
    ]))
export const generatedPolicies=new SSM.Parameter()
    .Type("String")
    .Value("paul")
    .policies([
        new SSM.Parameter.Policy.Expiration()
            .Timestamp("test${param.a.Value}")
    ])