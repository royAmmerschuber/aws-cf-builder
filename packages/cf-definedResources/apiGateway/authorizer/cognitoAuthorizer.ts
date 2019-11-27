import _ from "lodash/fp";
import { Authorizer } from "../authorizer";
import { Field } from "aws-cf-builder-core/field";
import { Attr } from "aws-cf-builder-core/util"
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { checkValid, stacktrace, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
/**
 * This Authorizer is specificaly made for cognito User Pools
 * 
 * The AWS::ApiGateway::Authorizer resource creates an authorization 
 * layer that Amazon API Gateway (API Gateway) activates for methods 
 * that have authorization enabled. API Gateway activates the 
 * authorizer when a client calls those methods.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html)
 */
export class CognitoAuthorizer extends Authorizer{
    /**
     * @param name The name of the authorizer.
     * 
     * **maps:** `Name`
     */
    constructor(name:Field<string>){
        super(name,1);
        this._.type="COGNITO_USER_POOLS";
    }
    
    /**
     * **required:true**
     * 
     * **maps:** `ProviderARNs`
     * @param providers A list of the Amazon Cognito user pool Amazon Resource 
     * Names (ARNs) to associate with this authorizer. For more information, 
     * see Use Amazon Cognito User Pools in the API Gateway Developer Guide.
     */
    Provider(...providers:Attr<"Arn">[]):this{
        this._.providers.push(...providers.map(v=>Attr.get(v,"Arn")));
        return this;
    }

    [checkValid](){
        const out:SMap<ResourceError>=super[checkValid]()
        const errors:string[]=[]
        if(!this._.providers.length){
            errors.push("you must specify atleast one Provider");
        }
        if(errors.length){
            const e= out[this[stacktrace]];
            if(e){
                e.errors.push(...errors);
            }else{
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors:errors
                };
            }
        }
        return out;
    }
}
