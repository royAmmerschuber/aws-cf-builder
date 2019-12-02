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