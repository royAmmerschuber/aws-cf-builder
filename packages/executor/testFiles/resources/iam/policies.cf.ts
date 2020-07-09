import { PolicyOut } from "aws-cf-builder-defined-resources/iam/policy/policyDocument"

const doc:PolicyOut={Version:"2012-10-17",Statement:[]}
//full
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
//empty
export const mngd2=new Iam.ManagedPolicy()
    .Document(doc)
//name variations
export const mngd3=new Iam.ManagedPolicy()
    .Document(doc)
    .name("paul")
export const mngd4=new Iam.ManagedPolicy()
    .Document(doc)
    .name("peter","paul")

export const policy1=new Iam.Policy()
    .Document(doc)
    .Name("paul")