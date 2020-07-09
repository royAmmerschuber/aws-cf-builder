import { PolicyOut } from "aws-cf-builder-defined-resources/iam/policy/policyDocument"

const doc:PolicyOut={Version:"2012-10-17",Statement:[]}
export const managedPolicy=new Iam.ManagedPolicy()
    .Document(doc)
export const policy1=new Iam.Policy()
    .Document(doc)
    .Name("paul")

//full
export const role=new Iam.Role()
    .AssumePolicy(new Iam.Policy.Document()
        .Statement(new Iam.Policy.Statement()
            .Actions("sts:AssumeRole")))
    .managedPolicies("something","paul",managedPolicy)
    .maxDuration(59)
    .permissionBoundary(managedPolicy)
    .name("kevin/meier")
    .policy(managedPolicy,policy1)
    .policy("test",{ Version:"2012-10-17", Statement:[ { Effect:"Allow" } ] })
    .policy({
        paul:{ Version:"2012-10-17", Statement:[ { Effect:"Deny" } ] },
        karl:{ Version:"2012-10-17", Statement:[ { Effect:"Allow", Action:"*" } ] },
    })
    .instanceProfile("peter/pan")
//empty
export const role2=new Iam.Role()
    .AssumePolicy(doc)
//instanceProfile && name variations && AssumePolicy
export const role3=new Iam.Role()
    .AssumePolicy("*")
    .name("peter")
    .instanceProfile("peter","paul")
export const role4=new Iam.Role()
    .AssumePolicy("AWS","arn:something:::")
    .name("peter",role.a.instanceProfileArn)
    .instanceProfile()
export const role5=new Iam.Role()
    .AssumePolicy(doc)
    .instanceProfile("peter")
    .name(role.a.instanceProfileName)