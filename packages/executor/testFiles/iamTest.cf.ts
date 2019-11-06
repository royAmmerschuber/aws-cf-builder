export const role=new Iam.Role()
    .AssumePolicy(new Iam.Policy.Document()
        .Statement(new Iam.Policy.Statement()
            .Actions("dynamodb:PutItem")
            
            .blacklistPrincipals()
            .principals("AWS","something","nothin")))
    .name("peter/pan")
    .policy({
        peter:new Iam.Policy.Document()
            .Statement(new Iam.Policy.Statement()
                .Actions("sts:AssumeRole")
                .resources(
                    "arn:whatever",
                    "arn:two"
                ))
    })
    .policy(new Iam.Policy()
        .Name("karl")
        .Document({
            Version:"2012-10-17",
            Statement:[
                {
                    Effect:"Allow",
                    Action:"*"
                }
            ]
        }))

export const kevin=new Iam.User()
    .group(new Iam.Group())

export const paul=new Iam.User()
    .name(Sub`test${role.r} ${Aws.region}`,"peter")
    .policy("meier",new Iam.Policy.Document()
        .Statement(new Iam.Policy.Statement()
            .Actions("nothing")
            .resources(
                "me",
                "you"
            )))
    .key(
        new Iam.AccessKey(),
        new Iam.AccessKey("private"),
        new Iam.AccessKey("biz")
            .status("Inactive")
    )
    .group(new Iam.Group()
        .name("ma name")
        .user(kevin,"yolo")
        .managedPolicies(new Iam.Policy.Managed()
            .Name("sven/kevin")
            .Document({
                Version:"2012-10-17",
                Statement:[]
            })))