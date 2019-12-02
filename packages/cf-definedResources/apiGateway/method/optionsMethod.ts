import { Method } from "../method";
import { ApiNode } from "../api";
/**
 * this Method is used to generate an Options method for a given api node
 * 
 * The AWS::ApiGateway::Method resource creates Amazon API Gateway (API Gateway) 
 * methods that define the parameters and body that clients must send in their requests.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html)
 */
export class OptionsMethod extends Method{
    private static auth={type:"NONE"};
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
        super(1);
        this._.authorization=OptionsMethod.auth;
        let methods="";
        for(let m in node){
            if(m!="branch"){
                methods+=m+","
            }
        }
        methods+="OPTIONS";
        this._.integration={
            IntegrationResponses:[
                {
                    StatusCode:"200",
                    ResponseParameters:{
                        "method.response.header.Access-Control-Allow-Headers": `'${headers}'`,
                        "method.response.header.Access-Control-Allow-Methods": `'${methods}'`,
                        "method.response.header.Access-Control-Allow-Origin": `'${origin}'`
                    }
                }
            ],
            PassthroughBehavior:"WHEN_NO_MATCH",
            RequestTemplates:{
                "application/json": '{"statusCode":200}'
            },
            Type:"MOCK"
        },
        this._.responses=[{
            code:"200",
            models:{
                "application/json":"Empty"
            },
            headers:{
                "Access-Control-Allow-Headers": false,
                "Access-Control-Allow-Methods": false,
                "Access-Control-Allow-Origin": false
            }
        }]
    }
}