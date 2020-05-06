export const managedPolicy=new Iam.ManagedPolicy()
    .Document(new Iam.Policy.Document()
        .Statement(
            new Iam.Policy.Statement("peter")
                .Actions("*")
                .resources("*")
                .principals("*"),
            new Iam.Policy.Statement()
                .Actions("something","somethingelse"),
            new Iam.Policy.Statement()
                .restrict()
                .Actions("one","two")
                .principals("Service","ichi","ni"),
            new Iam.Policy.Statement()
                .Actions("yo")
                .blacklistActions()
                .principals("Federated","one","two")
                .blacklistPrincipals()
                .resources("yo","lo","no")
                .blacklistResources(),
            {
                Effect:"Allow",
                Action:["yo"]
            }
        ))
    .description("something")
    .name("karl/paul")
export const mngd2=new Iam.ManagedPolicy()
    .Document({
        Version:"2012-10-17",
        Statement:[]
    })
export const mngd3=new Iam.ManagedPolicy()
    .Document({ Version:"2012-10-17", Statement:[] })
    .name("paul")
export const mngd4=new Iam.ManagedPolicy()
    .Document({ Version:"2012-10-17", Statement:[] })
    .name("peter","paul")

export const policy1=new Iam.Policy()
    .Document({Version:"2012-10-17",Statement:[]})
    .Name("paul")

export const role=new Iam.Role()
    .AssumePolicy(new Iam.Policy.Document()
        .Statement(new Iam.Policy.Statement()
            .Actions("sts:AssumeRole")))
    .managedPolicies("something","paul",managedPolicy)
    .maxDuration(59)
    .permissionBoundary(mngd2)
    .name("kevin/meier")
    .policy(mngd3,policy1)
    .policy("test",{ Version:"2012-10-17", Statement:[ { Effect:"Allow" } ] })
    .policy({
        paul:{ Version:"2012-10-17", Statement:[ { Effect:"Deny" } ] },
        karl:{ Version:"2012-10-17", Statement:[ { Effect:"Allow", Action:"*" } ] },
    })
    .instanceProfile("peter/pan")
export const role2=new Iam.Role()
    .AssumePolicy({ Version:"2012-10-17", Statement:[] })
export const role3=new Iam.Role()
    .AssumePolicy({ Version:"2012-10-17", Statement:[] })
    .name("peter")
    .instanceProfile("peter","paul")
export const role4=new Iam.Role()
    .AssumePolicy({ Version:"2012-10-17", Statement:[] })
    .name("peter",role.a.instanceProfileArn)
    .instanceProfile()
export const role5=new Iam.Role()
    .AssumePolicy({ Version:"2012-10-17", Statement:[] })
    .instanceProfile("peter")
    .name(role.a.instanceProfileName)