//#region imports
import { Module } from "./general/module";
import { Aws } from "../dist/aws/provider";
import { LambdaFunction } from "../dist/aws/Lambda/function";
import { Variable } from "./general/variable";
import { Role } from "../dist/aws/Iam/role";
import { RolePolicy } from "../dist/aws/Iam/rolePolicy";
import { Permission } from "../dist/aws/Lambda/permission";
import { EventRule } from "../dist/aws/Cloudwatch/eventRule";
import { EventTarget } from "../dist/aws/Cloudwatch/eventTarget";
import { Parameter } from "../dist/aws/Ssm/parameter";
import { PolicyDocument, PolicyStatement } from "./awsExtras/policyDocument";
//#endregion
try{

    const vars={
        userPool:new Variable("userPool","string"),
        userPoolArn:new Variable("userPoolArn","string"),
        samlClient:new Variable("samlClient","string"),
        adTenant:new Variable("adTenant","string"),
        adClientSecret:new Variable("adClientSecret","string"),
        adClientId:new Variable("adClientId","string"),
        userTable:new Variable("userTable","string"),
    }
    const adClientSecretSSMParam=new Parameter("adClientSecret")
        .Type("SecureString")
        .Value(vars.adClientSecret)
    const lambdas=(()=>{
        const baseStatements=[
            new PolicyStatement("cognito")
                .Actions("cognito-idp:*")
                .resources(vars.userPool),
            new PolicyStatement("logging")
                .Actions("logs:*")
                .resources("*"),
            new PolicyStatement("ssmParameterAccess")
                .Actions("ssm:GetParameter")
                .resources(adClientSecretSSMParam.d.arn)
        ]
        const assumeDocument=new PolicyDocument()
            .statement(new PolicyStatement()
                .Actions("sts:AssumeRole")
                .principals("Service","lambda.amazonaws.com"))
        const cogSyncRole=new Role("sync")
            .path("/adi/lambda/")
            .AssumeRolePolicy(assumeDocument)
            .rolePolicy(new RolePolicy("main")
                .Policy(new PolicyDocument()
                    .statement(
                        ...baseStatements,
                        new PolicyStatement("dynamoDb")
                            .Actions("dynamodb:BatchWriteItem")
                            .resources())))
        const cogRole=new Role("getUser")
            .path("/adi/lambda/")
            .AssumeRolePolicy(assumeDocument)
            .rolePolicy(new RolePolicy("main")
                .Policy(new PolicyDocument()
                    .statement(...baseStatements)))

        return {
            sync:new LambdaFunction("adiCognitoGroupSync")
                .Handler("index.handler")
                .environment({variables:{
                    userPool:vars.userPool,
                    samlClient:vars.samlClient,
                    adTenant:vars.adTenant,
                    adClientSecretSSMParam:adClientSecretSSMParam.d.name,
                    adClientId:vars.adClientId,
                    userTable:vars.userTable,
                }})
                .filename("functions/sync.zip")
                .Role(cogSyncRole.d.arn)
                .Runtime("nodejs8.10")
                .timeout(5*60)
                .permission(new Permission("cognito")
                    .Action("lambda:InvokeFunction")
                    .Principal("cognito-idp.amazonaws.com")
                    .sourceArn(vars.userPoolArn)),
            getUsers:new LambdaFunction("adiGetUsers")
                .Handler("index.handler")
                .environment({variables:{
                    samlClient:vars.samlClient,
                    adTenant:vars.adTenant,
                    adClientSecretSSMParam:adClientSecretSSMParam.d.name,
                    adClientId:vars.adClientId,
                }})
                .filename("functions/getUser.zip")
                .Role(cogRole.d.arn)
                .Runtime("nodejs8.10")
                .permission(new Permission("main")
                    .Action("lambda:InvokeFunction")
                    .Principal("apigateway.amazonaws.com"))
        }
    })()
    const cwRule=new EventRule("CognitoADSync")
        .isEnabled(true)
        .eventPattern("cron(0,1/6,*,*,?,*)")
        .eventTarget(new EventTarget("")
            .Arn(lambdas.sync.d.arn))

    lambdas.sync.permission(
        new Permission("cloudwatch")
            .Action("lambda:InvokeFunction")
            .Principal("cloudwatch.amazonaws.com")
            .sourceArn(cwRule.d.arn)
    )
    console.log(JSON.stringify(
        new Module()
            .providers(
                new Aws()
                    .Region("us-east-1")
                    .accessKey("fjdklasfjdklas")
            )
            .resources(
                lambdas
            )
            .generate()
    ,undefined,4))
}
catch(e){
    console.log(e)
}