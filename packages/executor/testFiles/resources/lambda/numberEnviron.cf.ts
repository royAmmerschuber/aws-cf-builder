export const l=new Lambda.Function()
    .Code("somePath")
    .Role("someRole")
    .Runtime("nodejs12.x")
    .environment({
        paul:4,
        meier:"sven"
    })
    .environment("karl",95)
    .environment("karl2","nivek")