import { Module } from "./general/module";
import { Aws } from "../dist/aws/provider";

console.log(JSON.stringify(
    new Module()
        .providers(new Aws()
            .Region("us-east-1")
            .accessKey("fjdklasfjdklas")
            .endpoints({
                apigateway:"localhost"
            }))
        .generate()
,undefined,4))