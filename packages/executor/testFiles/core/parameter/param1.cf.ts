export const p1=new Parameter()
    .name("someName")
    .Type("AWS::EC2::AvailabilityZone::Name")
    .constraintDescription("some constraint")
    .default("bjkaldfa")
    .description("fjdoqnvdaxmal")
    .max(4)
    .min(1)
    .noEcho()
export const p2=new Parameter()
    .Type("Number")
export const p3=new Parameter("listTest","List<Number>")
    .default([1,2,3,4])
    .max(4)
    .min(1)
export const p7=new Parameter()
    .Type("List<Number>")
    .default("1,2,3,4")
export const p4=new Parameter().Type("Number")
    .default(43)
    .max(4)
    .min(1)
export const p5=new Parameter().Type("Number")
    .default("43")
export const p6=new Parameter()
    .Type("CommaDelimitedList")
    .default(["a","b","c"])
    .max(4)
    .min(1)
export const p8=new Parameter()
    .Type("CommaDelimitedList")
    .default("a,b,c,d")