import { Module } from "./general/module";
import { Aws } from "../dist/aws/provider";
import { Function } from "../dist/aws/Lambda/function";
import { Permission } from "../dist/aws/Lambda/permission";
import { RestApi } from "../dist/aws/ApiGateway/restApi";
import { Role } from "../dist/aws/Iam/role";
console.log(JSON.stringify(
    new Module()
        .providers(
            new Aws()
                .Region("us-east-1")
                .accessKey("fjdklasfjdklas")
                .endpoints({
                    s3:"localhost:4000"
                })
                .assumeRole({
                    role_arn:"blablabla"
                })
        )
        .resources(
            new Permission(
                new Function("christopher")
                    .Handler("pedro")
                    .Runtime("handler.index")
                    .Role(new Role("pierre")
                        .AssumeRolePolicy("nothing")
                        .d.arn)
                    .d.arn,
                "paul"
            )
                .Action("dynamodb.*")
                .Principal("üaiö"),
            new RestApi("pedro"),
            new RestApi.Data("karl")
        )
        .generate()
,undefined,4))