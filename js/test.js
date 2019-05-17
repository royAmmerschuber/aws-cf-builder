"use strict";
exports.__esModule = true;
//#region imports
var module_1 = require("./general/module");
var provider_1 = require("../dist/aws/provider");
var function_1 = require("../dist/aws/Lambda/function");
var variable_1 = require("./general/variable");
var role_1 = require("../dist/aws/Iam/role");
var rolePolicy_1 = require("../dist/aws/Iam/rolePolicy");
var permission_1 = require("../dist/aws/Lambda/permission");
var eventRule_1 = require("../dist/aws/Cloudwatch/eventRule");
var eventTarget_1 = require("../dist/aws/Cloudwatch/eventTarget");
var parameter_1 = require("../dist/aws/Ssm/parameter");
//#endregion
var vars = {
    userPool: new variable_1.Variable("userPool", "string"),
    userPoolArn: new variable_1.Variable("userPoolArn", "string"),
    samlClient: new variable_1.Variable("samlClient", "string"),
    adTenant: new variable_1.Variable("adTenant", "string"),
    adClientSecret: new variable_1.Variable("adClientSecret", "string"),
    adClientId: new variable_1.Variable("adClientId", "string"),
    userTable: new variable_1.Variable("userTable", "string")
};
var adClientSecretSSMParam = new parameter_1.Parameter("adClientSecret")
    .Type("SecureString")
    .Value(vars.adClientSecret);
var lambdas = (function () {
    var cogSyncRole = new role_1.Role("sync")
        .path("/adi/lambda/")
        .AssumeRolePolicy("testblabla")
        .rolePolicy(new rolePolicy_1.RolePolicy("")
        .Policy("great suttf"));
    var cogRole = new role_1.Role("getUser")
        .path("/adi/lambda/")
        .AssumeRolePolicy("testblabla")
        .rolePolicy(new rolePolicy_1.RolePolicy("")
        .Policy("great policy stuff"));
    return {
        sync: new function_1.Function("adiCognitoGroupSync")
            .Handler("index.handler")
            .environment({ variables: {
                userPool: vars.userPool,
                samlClient: vars.samlClient,
                adTenant: vars.adTenant,
                adClientSecretSSMParam: adClientSecretSSMParam.d.name,
                adClientId: vars.adClientId,
                userTable: vars.userTable
            } })
            .filename("functions/sync.zip")
            .Role(cogSyncRole.d.arn)
            .Runtime("nodejs8.10")
            .timeout(5 * 60)
            .permission(new permission_1.Permission("cognito")
            .Action("lambda:InvokeFunction")
            .Principal("cognito-idp.amazonaws.com")
            .sourceArn(vars.userPoolArn)),
        getUsers: new function_1.Function("adiGetUsers")
            .Handler("index.handler")
            .environment({ variables: {
                samlClient: vars.samlClient,
                adTenant: vars.adTenant,
                adClientSecretSSMParam: adClientSecretSSMParam.d.name,
                adClientId: vars.adClientId
            } })
            .filename("functions/getUser.zip")
            .Role(cogRole.d.arn)
            .Runtime("nodejs8.10")
            .permission(new permission_1.Permission("main")
            .Action("lambda:InvokeFunction")
            .Principal("apigateway.amazonaws.com"))
    };
})();
var cwRule = new eventRule_1.EventRule("CognitoADSync")
    .isEnabled(true)
    .eventPattern("cron(0,1/6,*,*,?,*)")
    .eventTarget(new eventTarget_1.EventTarget("")
    .Arn(lambdas.sync.d.arn));
lambdas.sync.permission(new permission_1.Permission("cloudwatch")
    .Action("lambda:InvokeFunction")
    .Principal("cloudwatch.amazonaws.com")
    .sourceArn(cwRule.d.arn));
console.log(JSON.stringify(new module_1.Module()
    .providers(new provider_1.Aws()
    .Region("us-east-1")
    .accessKey("fjdklasfjdklas"))
    .resources(lambdas)
    .generate(), undefined, 4));
