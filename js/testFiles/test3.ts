const aws=Custom("aws").resources

export const params={
    userPoolArn:Variable(),
    dominoNameAttributeName:Variable(),
    domainName:Variable(),
    snsfPath:Variable(),
    ltpaSecretSSM:Variable(),
    customerPrefix:Variable()
}

const tags={
    customer:params.customerPrefix
}

export const role={
    lambda:aws.IamRole()
}
const lambdaTempl=(name:string)=>aws.LambdaFunction()
        .Handler("index.handler")
        .runtime("nodejs10.x")
        .Timeout(10)
        .FunctionName(name)
        .Role(role.lambda.d.arn)
        .tags(tags)
        .permission(aws.LambdaPermission()
            .Action("lambda:InvokeFUnction")
            .Principal("apigateway.amazonaws.com"))
        
export const lambdas={
    getViewData:lambdaTempl("RecPostRecommendation")
        .codeUri("../lambdas/postRecommendation")
        .Environment({Variable:{
            domainName:params.domainName,
            snsfPath:params.snsfPath,
            ltpaSecretSSM:params.ltpaSecretSSM,
            dNameAttributeName:params.dominoNameAttributeName
        }}),
    getRecommendation:lambdaTempl("RecGetRecommendation")
        .codeUri("../lambdas/postRecommendation")
        .Environment({Variables:{
            domainName:params.domainName,
            snsfPath:params.snsfPath,
            ltpaSecretSSM:params.ltpaSecretSSM,
            dNameAttributeName:params.dominoNameAttributeName
        }}),
    postRecommendation:lambdaTempl("RecPostRecommendation")
        .codeUri("../lambdas/postRecommendation")
        .Environment({Variables:{
            domainName:params.domainName,
            snsfPath:params.snsfPath,
            ltpaSecretSSM:params.ltpaSecretSSM,
            dNameAttributeName:params.dominoNameAttributeName
        }}),
    getBinders:lambdaTempl("RecGetBinder")
        .codeUri("../lambdas/getBinder")
        .Environment({Variables:{
            domainName:params.domainName,
            snsfPath:params.snsfPath,
            ltpaSecretSSM:params.ltpaSecretSSM,
            dNameAttributeName:params.dominoNameAttributeName
        }})
}