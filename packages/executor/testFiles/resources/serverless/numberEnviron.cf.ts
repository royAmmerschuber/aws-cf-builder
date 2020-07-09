export const l=new Serverless.Function()
    .Code("somePath")
    .Runtime("dotnetcore1.0")
    .environment({
        paul:4,
        meier:"sven"
    })
    .environment("karl",95)
    .environment("karl2","nivek")