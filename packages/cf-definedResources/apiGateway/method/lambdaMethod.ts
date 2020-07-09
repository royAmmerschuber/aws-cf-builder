import { Method, MethodOut } from "../method";
import _ from "lodash/fp";
import { LambdaExecutable } from "../../lambda/function";
import { Attr } from "aws-cf-builder-core/util";
import { Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { generateObject, checkCache } from "aws-cf-builder-core/symbols";
import { checkValid, stacktrace, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { Sub } from "aws-cf-builder-core/fields/substitution"
import * as AWS from "../../aws"

/**
 * this Resource is specialy for lambda functions and automates a lot of things so that 
 * you just have to give it the lambda function.
 * 
 * it automatically configures the integration
 * 
 * The AWS::ApiGateway::Method resource creates Amazon API Gateway (API Gateway) 
 * methods that define the parameters and body that clients must send in their requests.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html)
 */
export class LambdaMethod extends Method{
    //#region parameters
    protected _:Method["_"] &{
        lambda:Field<string>
    }
    //#endregion
    constructor(){
        super(1);
    }
    //#region references
    /**
     * **required:true**
     * @param lambda the lambda function to call
     * 
     * **maps:** `Integration.Uri`
     */
    Lambda(lambda:Attr<LambdaExecutable>){
        this._.lambda=Attr.get(lambda,"Arn")
        return this;
    }
    //#endregion

    //#region resourceFunctions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>=super[checkValid]()
        const errors:string[]=[]
        if(!this._.lambda){
            errors.push("you must specify a Lambda");
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
        return this[checkCache]=out;
    }
    [generateObject]():MethodOut {
        const base=super[generateObject]();
        base.Properties.Integration={
            ...base.Properties.Integration,
            Type:"AWS_PROXY",
            IntegrationHttpMethod:"POST",
            Uri:Sub`arn:aws:apigateway:${AWS.region}:lambda:path/2015-03-31/functions/${this._.lambda}/invocations` as Field<string>
        }
        return base
    }
    //#endregion
}