import { Authorizer } from "./authorizer";
import { Api } from "./api";
import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Ref, prepareQueueBase } from "aws-cf-builder-core/util";
import { Field } from "aws-cf-builder-core/field";
import { SMap, Preparable, PreparableError } from "aws-cf-builder-core/general";
import { Model } from "./model";
import { checkValid, checkCache, pathName } from "aws-cf-builder-core/symbols";
import { ResourceError } from "aws-cf-builder-core/general";
import { stacktrace, prepareQueue } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { callOn } from "aws-cf-builder-core/util";
import { generateObject } from "aws-cf-builder-core/symbols";
import { findInPath } from "aws-cf-builder-core/util";
import { ApiResource } from "./resource";
import { pathItem, namedPath } from "aws-cf-builder-core/path";
import { PathDataCarrier } from "aws-cf-builder-core/path";
import { resourceIdentifier } from "aws-cf-builder-core/symbols";

/**
 * The AWS::ApiGateway::Method resource creates Amazon API Gateway (API Gateway) 
 * methods that define the parameters and body that clients must send in their requests.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html)
 */
export abstract class Method extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::ApiGateway::Method";

    //#region parameters
    protected _:{
        requireKey:boolean,
        integration:Integration,
        responses:MethodResponse[],
        authorization:Authorization,

        restApiId:Field<string>,
        resourceId:Field<string>,
        method:Field<string>
    }
    //#endregion
    /**
     * the method ID, such as `mysta-metho-01234b567890example`.
     */
    r:ReferenceField
    /**
     * 
     * @param OpName A friendly operation name for the method. For example, you can assign the OperationName
     * of ListPets for the GET /pets method.
     * 
     * **maps:** `OperationName`
     */
    constructor(
        eDepth:number,
        private operationName?:string
    ){
        super(1+eDepth);
        this._={
            responses:[]
        } as any
    }

    //#region simple properties
    
    /**
     * sets the authorization data for the method
     * 
     * **required:true**
     * 
     * **maps:** `AuthorizationType` & `AuthorizationScopes` & `AuthorizationId`
     * @param type The method's authorization type. For valid values, see 
     * Method in the API Gateway API Reference.
     * 
     * **maps:** `AuthorizationType`
     * @param authorizer The identifier of the authorizer to use on this method. 
     * If you specify this property, specify CUSTOM for the AuthorizationType 
     * property.
     * 
     * **maps:** `AuthorizationId`
     * @param scopes A list of authorization scopes configured on the method. The 
     * scopes are used with a COGNITO_USER_POOLS authorizer to authorize the 
     * method invocation. The authorization works by matching the method scopes 
     * against the scopes parsed from the access token in the incoming request. 
     * The method invocation is authorized if any method scopes matches a claimed 
     * scope in the access token. Otherwise, the invocation is not authorized. 
     * When the method scope is configured, the client must provide an access 
     * token instead of an identity token for authorization purposes.
     * 
     * **maps:** `AuthorizationScopes``
     */
    Authorization(type:"NONE"|"AWS_IAM"):this;
    Authorization(type:"CUSTOM",authorizer:Ref<Authorizer>):this;
    Authorization(type:"COGNITO_USER_POOLS",authorizer:Ref<Authorizer>,scopes?:Field<string>[]):this;
    Authorization(type:AuthorizationType,authorizer?:Ref<Authorizer>,scopes?:Field<string>[]):this{
        this._.authorization={
            type:type,
            authorizer:authorizer instanceof Resource
                ? authorizer.r
                : authorizer,
            scopes:scopes
        };
        return this;
    }

    /**
     * adds a Response Object
     * 
     * MethodResponse is a property of the AWS::ApiGateway::Method resource that
     * defines the responses that can be sent to the client who calls an Amazon
     * API Gateway (API Gateway) method.
     * 
     * **required:false**
     * 
     * **maps:** `MethodResponses._`
     * @param code The method response's status code, which you map to an 
     * IntegrationResponse.
     * 
     * **maps:** `MethodResponses._.StatusCode`
     * @param models The resources used for the response's content type. Specify
     * response models as key-value pairs (string-to-string maps), with a content
     * type as the key and a Model resource name as the value.
     * 
     * **maps:** `MethodResponses._.ResponseModels`
     * @param headers Response parameters that API Gateway sends to the client that 
     * called a method. Specify response parameters as key-value pairs 
     * (string-to-Boolean maps), with a destination as the key and a Boolean as the
     * value.
     * 
     * In the output these will automaticly get prefixed with `method.response.header.`
     * 
     * **maps:** `MethodResponses._.ResponseParameters`
     */
    response(code:string,models?:SMap<Ref<Model>>,headers?:SMap<boolean>):this{
        this._.responses.push({
            code:code,
            models:models && _.mapValues(v =>{
                if(v instanceof Model){
                    return v.r
                }
                return v
            },models),
            headers:headers
        });
        return this;
    }

    /**
     * **maps:** `ApiKeyRequired`
     * 
     * **required: false**
     * @param require Indicates whether the method requires clients to submit a 
     * valid API key.
     * 
     * **default:** `true`
     */
    requireApiKey(require:boolean=true){
        this._.requireKey=require;
        return this;
    }
    //#endregion
    
    //#region resource functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.authorization){
            errors.push("you must specify an Authorization");
        }
        
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOn(this._,Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,{})
    }
    public [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable as any,(o:Preparable)=>{
                o[prepareQueue](stack,this,true)
            })
            const { api, res }=findInPath(path,{
                api:Api,
                res:ApiResource
            })
            if(!(path instanceof PathDataCarrier && path.data.method)){
                throw new PreparableError(this,"method type not found in path")
            }
            this._.method=path.data.method

            if(!api) throw new PreparableError(this,"api not found in path")
            this._.restApiId=api.obj.r
            if(res && api.depth>res.depth){
                this._.resourceId=res.obj.r
            }else{
                this._.resourceId=api.obj.a.RootResourceId
            }
        }
    }
    [generateObject](){
        return {
            Type:this[resourceIdentifier],
            Properties:{
                AuthorizationType:this._.authorization.type,
                AuthorizationScopes:this._.authorization.scopes,
                AuthorizerId:this._.authorization.authorizer,

                Integration:this._.integration,
                MethodResponses:this._.responses.length 
                    ? this._.responses.map(({ models, headers, code }) => ({
                        ResponseModels:_.size(models) 
                            ? models 
                            : undefined,
                        ResponseParameters:_.size(headers) 
                            ? _.mapKeys(k => "method.response.header."+k, headers)
                            : undefined,
                        StatusCode:code
                    }))
                    : undefined,
                OperationName:this.operationName,
                ApiKeyRequired:this._.requireKey,

                HttpMethod:this._.method,
                ResourceId:this._.resourceId,
                RestApiId:this._.restApiId
            }
        }
        
    }
    [pathName](){
        if(typeof this._.method=="string"){
            return _.capitalize(this._.method)
        }
        return ""
    }
    //#endregion
}
import { OptionsMethod } from "./method/optionsMethod";
import { LambdaMethod } from "./method/lambdaMethod";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
export namespace Method{
    export const Option=OptionsMethod
    export const Lambda=LambdaMethod
}
export type AuthorizationType="NONE"|"AWS_IAM"|"CUSTOM"|"COGNITO_USER_POOLS";
export type IntegrationType="AWS"|"AWS_PROXY"|"HTTP"|"HTTP_PROXY"|"MOCK";
/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apitgateway-method-integration.html)
 */
export interface Integration{
    Type:Field<IntegrationType>;
    CacheKeyParameters ?: Field<string>[];
    CacheNamespace ?: Field<string>,
    ConnectionId ?: Field<string>,
    ConnectionType ?: Field<string>,
    ContentHandling ?: Field<string>,
    Credentials ?: Field<string>,
    IntegrationHttpMethod ?: Field<string>,
    IntegrationResponses ?: IntegrationResponse[],
    PassthroughBehavior ?: Field<string>,
    RequestParameters ?: SMap<Field<string>>,
    RequestTemplates ?: SMap<Field<string>>,
    TimeoutInMillis ?: number,
    Uri ?: Field<string>
}
/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apitgateway-method-integration-integrationresponse.html)
 */
export interface IntegrationResponse{
    ContentHandling ?: Field<string>,
    ResponseParameters ?: SMap<Field<string>>,
    ResponseTemplates ?: SMap<Field<string>>,
    SelectionPattern ?: Field<string>,
    StatusCode : Field<string>
}
/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apitgateway-method-methodresponse.html)
 */
interface MethodResponse{
    code:Field<string>;
    models?:SMap<Field<string>>;
    headers?:SMap<Field<boolean>>;
}

interface Authorization{
    type:string,
    authorizer?:Field<string>,
    scopes?:Field<string>[]
}