import { Method } from "../method";
import { ApiNode } from "../api";
import { IntegrationResponse } from "./integrationResponse";
import { generateObject } from "aws-cf-builder-core/symbols";
/**
 * this Method is used to generate an Options method for a given api node
 * 
 * The AWS::ApiGateway::Method resource creates Amazon API Gateway (API Gateway) 
 * methods that define the parameters and body that clients must send in their requests.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html)
 */
export class OptionsMethod extends Method{
    /**
     * 
     * @param node the Api node where the options method will be placed
     * @param origin the string of origins allowed
     * 
     * **default:** `"*"`
     * @param headers the headers wich are allowed
     * 
     * **default:** `"Content-Type,X-Amz-Date,Authorization,auth,X-Api-Key,X-Amz-Security-Token"`
     */
    constructor(
        node:ApiNode,
        origin:string="*",
        headers:string="Content-Type,X-Amz-Date,Authorization,auth,X-Api-Key,X-Amz-Security-Token"
    ){
        super(2);
        this._.authorization={type:"NONE"};
        let methods="";
        for(let m in node){
            if(m!="branch"){
                methods+=m+","
            }
        }
        methods+="OPTIONS";
        this.integrationResponse(new IntegrationResponse()
            .StatusCode("200")
            .parameterMapping({
                "method.response.header.Access-Control-Allow-Headers": `'${headers}'`,
                "method.response.header.Access-Control-Allow-Methods": `'${methods}'`,
                "method.response.header.Access-Control-Allow-Origin": `'${origin}'`
            }))
        this.passthrougBehavior("WHEN_NO_MATCH")
        this.requestTemplateMapping("application/json",JSON.stringify({
            statusCode:200
        }))
        this.response("200",{
            "application/json":"Empty"
        },{
            "Access-Control-Allow-Headers": false,
            "Access-Control-Allow-Methods": false,
            "Access-Control-Allow-Origin": false
        })
    }
    [generateObject](){
        const base=super[generateObject]()
        base.Properties.Integration.Type="MOCK"
        return base
    }
}