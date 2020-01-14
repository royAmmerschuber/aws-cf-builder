export namespace lambdas{
    export const runWierdStuff=Alias("testFunction",new Lambda.Function()
        .Code("peter")
        .Role("something")
        .Runtime("python2.7"))
}
export const out=new Output("paul")
    .Value(Sub`${lambdas.runWierdStuff.r}::${lambdas.runWierdStuff.a.Arn}`)