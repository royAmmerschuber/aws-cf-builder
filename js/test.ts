import { Module } from "./general/module";
import { Aws } from "../dist/aws/provider";
import { Function } from "../dist/aws/Lambda/function";
import { Permission } from "../dist/aws/Lambda/permission";
import { RestApi } from "../dist/aws/ApiGateway/restApi";
import { Role } from "../dist/aws/Iam/role";
import _ from "lodash";
//#region 
const gateway=(()=>{
    return [
        new RestApi("userbase"),
        new RestApi.Data("karl")
    ]
})()
const lambda=(()=>{
    const role=new Role("pierre")
        .AssumeRolePolicy("nothing")
    const invokePerm=new Permission("invoke")
        .Action("lambda:invoke")
        .Principal("me")
    return {
        getUser:new Function("getUser")
            .Handler("pedro")
            .Runtime("handler.index")
            .Role(role.d.arn)
            .permission(
                new Permission("db")
                    .Action("dynamodb.*")
                    .Principal(gateway[1].d.name),
                invokePerm
            ),
        setUser:new Function("setUser")
            .Handler("paul")
            .Role(role.d.arn)
            .Runtime("go")
            .permission(invokePerm),
    }
})()
console.log(JSON.stringify(
    new Module()
        .providers(
            new Aws()
                .Region("us-east-1")
                .accessKey("fjdklasfjdklas")
        )
        .resources(
            lambda,
            gateway
        )
        .generate()
,undefined,4))
//#endregion

type Constructor<T>=new (...args)=>T;