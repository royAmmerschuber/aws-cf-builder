export const func=new Serverless.Function()
    .Runtime("nodejs10.x")
    .InlineCode("console.log('nooo')")
    .environment({
        test:"paul"
    })
    .environment("peter","pan")
    .tag("seven","nine")
    .tag({
        one:"four",
        two:"three"
    })
    .events(new Serverless.Function.Event.Api()
        .Method("GET")
        .Path("/paul/peter")
        .authorizer("somethin")
        .api("test")
        .resourcePolicy("AwsAccountWhitelist",["peter","paul"])
        .requestParameter("header",[
            "paul",
            "peter",
            Sub`franz`
        ]))