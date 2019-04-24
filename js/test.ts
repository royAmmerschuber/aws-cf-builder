import { Module } from "./general/module";
import { Aws } from "../dist/aws/provider";
import { Function } from "../dist/aws/Resource/lambda/function";
import { Permission } from "../dist/aws/Resource/lambda/permission";
import { Role } from "../dist/aws/Resource/iam/role";
import { Function as DFunction } from "../dist/aws/DataSource/Lambda/function";
import { RestApi } from "../dist/aws/Resource/ApiGateway/restApi";
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
            new Permission()
                .Alias("paul")
                .Action("dynamodb:*")
                .FunctionName(new Function()
                    .Alias("paul")
                    .FunctionName(new DFunction()
                        .Alias("zero")
                        .FunctionName("ichi")
                        .d.functionName)
                    .Handler("pedro")
                    .Role(new Role("karl")
                        .AssumeRolePolicy("nothing to assume")
                        .d.arn)
                    .Runtime("node")
                    .d.functionName)
                .Principal("pedro"),
            new RestApi("pedro")                
        )
        .generate()
,undefined,4))