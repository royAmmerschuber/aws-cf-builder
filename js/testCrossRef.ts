import { LambdaFunction } from "../dist/aws/Lambda/function";
import { Module } from "./general/module";
import { Permission } from "../dist/aws/Lambda/permission";
const peterP=new Permission("P")
    .Action("stuffs")
    .Principal("great Principier")
const peter=new LambdaFunction("Peter")
    .Runtime("bla")
    .Handler("index.handler")
    .Role("greatesRoleEver")
    .permission(peterP)

const klaus=new LambdaFunction("Klaus")
    .Runtime("bla")
    .Handler("index.handler")
    .Role("greatesRoleEver")
    .permission(new Permission("K")
        .Action(peterP.d.action)
        .Principal("greater Principier"))

console.log(JSON.stringify(new Module()
    .resources(
        peter,
        klaus
    )
    .generate()))