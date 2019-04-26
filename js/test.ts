import { Module } from "./general/module";
import { Aws } from "../dist/aws/provider";
import { Function } from "../dist/aws/Resource/lambda/function";
import { Permission } from "../dist/aws/Resource/lambda/permission";
import { RestApi } from "../dist/aws/Resource/ApiGateway/restApi";
import { Role } from "../dist/aws/Resource/Iam/role";
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
            new RestApi("pedro")
        )
        .generate()
,undefined,4))