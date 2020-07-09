import { Authorizer } from "../authorizer";
import { Api } from "../api";
import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Ref, prepareQueueBase, callOnCheckValid, callOnPrepareQueue, notEmpty, Attr } from "aws-cf-builder-core/util";
import { Field } from "aws-cf-builder-core/field";
import { SMap, PreparableError } from "aws-cf-builder-core/general";
import { Model } from "../model";
import { checkValid, checkCache, pathName } from "aws-cf-builder-core/symbols";
import { ResourceError } from "aws-cf-builder-core/general";
import { stacktrace, prepareQueue } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { generateObject } from "aws-cf-builder-core/symbols";
import { findInPath } from "aws-cf-builder-core/util";
import { ApiResource } from "../resource";
import { pathItem, namedPath } from "aws-cf-builder-core/path";
import { PathDataCarrier } from "aws-cf-builder-core/path";
import { resourceIdentifier } from "aws-cf-builder-core/symbols";




//TODO add normal Method
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
        responses:Map<Field<string>,MethodResponse>,
        authorization:Authorization,
        operationName:Field<string>
        requestModels:SMap<Field<string>>
        requestParameters:SMap<Field<boolean>>
        requestValidator:Field<string>

        //integration
        cacheParameters:Field<string>[]
        cacheNS:Field<string>
        connection:{
            type:Field<string>
            id:Field<string>
        }
        contentHandling:Field<ContentHandling>
        credentials:Field<string>
        integrationResponses:Field<IntegrationResponseOut>[]
        passthrougBehavior:Field<PassthroughBehavior>
        requestParametersMapping:SMap<Field<string>>
        requestTemplateMapping:SMap<Field<string>>
        timeoutMs:Field<number>

        //inherit
        restApiId:Field<string>,
        resourceId:Field<string>,
        method:Field<string>
    } = {
        responses:new Map(),
        requestModels:{},
        requestParameters:{},
        cacheParameters:[],
        integrationResponses:[],
        requestParametersMapping:{},
        requestTemplateMapping:{},
    } as any
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
    ){
        super(1+eDepth);
    }

    //#region simple properties
    /**
     * 
     * @param name A friendly operation name for the method. For example, you can assign the 
     * OperationName of ListPets for the `GET /pets` method.
     */
    operationName(name:Field<string>){
        this._.operationName=name
        return this
    }
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
            authorizer:Ref.get(authorizer),
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
    response(code:Field<string>,models?:SMap<Ref<Model>>,headers?:SMap<boolean>):this{
        this._.responses.set(code,{
            models:models && _.mapValues(v =>Ref.get(v), models),
            headers,
        });
        return this;
    }
    /**
     * **required:false**
     * 
     * **maps:**`RequestModels`
     * @param contentType the content-type with wich to associate the model
     * @param model the model to associate with this content type
     */
    requestModels(contentType:string,model:Ref<Model>):this
    /**
     * **required:false**
     * 
     * **maps:**`RequestModels`
     * @param models The resources that are used for the request's content type. Specify
     * request models as key-value pairs (string-to-string mapping), with a content type
     * as the key and a Model resource name as the value.
     */
    requestModels(models:SMap<Ref<Model>>):this
    requestModels(cm:string|SMap<Ref<Model>>,model?:Ref<Model>){
        if(typeof cm=="string"){
            this._.requestModels[cm]=Ref.get(model)
        }else{
            _.entries(cm)
                .forEach(([k,m])=>this._.requestModels[k]=Ref.get(m))
        }
        return this
    }
    /**
     * The request parameters that API Gateway accepts.
     * 
     * **required:false**
     * 
     * **maps:**`RequestParameters`
     * @param location the location where to find the parameters
     * @param name the name of the parameter
     * @param required if the parameter is required
     */
    requestParameters(location:ParameterLocation,name:string,required:Field<boolean>):this
    /**
     * The request parameters that API Gateway accepts.
     * 
     * **required:false**
     * 
     * **maps:**`RequestParameters`
     * @param location the location where to find the parameters
     * @param parameters a map of parameter names and if they are required
     */
    requestParameters(location:ParameterLocation,parameters:SMap<Field<boolean>>):this
    requestParameters(location:ParameterLocation,np:string|SMap<Field<boolean>>,required?:Field<boolean>){
        if(typeof np=="string"){
            this._.requestParameters[`method.request.${location}.${np}`]=required
        }else{
            _.entries(np).forEach(([name,required])=>{
                this._.requestParameters[`method.request.${location}.${name}`]=required
            })
        }
        return this
    }
    /**
     * **required:false** 
     * @param ib The ID of the associated request validator.
     * 
     * **maps:**`RequestValidatorId`
     */
    requestValidator(ib:Ref<RequestValidator>){
        this._.requestValidator=Ref.get(ib)
        return this
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

    /**
     * **required:false**
     * @param params A list of request parameters whose values API Gateway caches. For cases
     * where the integration type allows for RequestParameters to be set, these parameters
     * must also be specified in RequestParameters to be supported in CacheKeyParameters.
     * 
     * **maps:**`Integration.CacheKeyParameters`
     */
    cacheParameters(...params:Field<string>[]){
        this._.cacheParameters.push(...params)
        return this
    }
    /**
     * **required:false**
     * @param name An API-specific tag group of related cached parameters.
     * 
     * **maps:**`Integration.CacheNamespace`
     */
    cacheNamespace(name:Field<string>){
        this._.cacheNS=name
        return this
    }
    /**
     * **required:false**
     * @param type The type of the network connection to the integration endpoint. The valid
     * value is `INTERNET` for connections through the public routable internet or `VPC_LINK` for
     * private connections between API Gateway and a network load balancer in a VPC. The
     * default value is `INTERNET`.
     * 
     * **maps:**`Integration.ConnectionType`
     */
    connection(type:"INTERNET"):this
    /**
     * **required:false**
     * @param type The type of the network connection to the integration endpoint. The valid
     * value is `INTERNET` for connections through the public routable internet or `VPC_LINK` for
     * private connections between API Gateway and a network load balancer in a VPC. The
     * default value is `INTERNET`.
     * 
     * **maps:**`Integration.ConnectionType`
     * @param connectionId The ID of the VpcLink used for the integration when
     * connectionType=`VPC_LINK`, otherwise undefined.
     * 
     * **maps:**`Integration.ConnectionId`
     * 
     */
    connection(type:"VPC_LINK",connectionId:Field<string>):this
    /**
     * **required:false**
     * @param type The type of the network connection to the integration endpoint. The valid
     * value is `INTERNET` for connections through the public routable internet or `VPC_LINK` for
     * private connections between API Gateway and a network load balancer in a VPC. The
     * default value is `INTERNET`.
     * 
     * **maps:**`Integration.ConnectionType`
     * @param connectionId The ID of the VpcLink used for the integration when
     * connectionType=`VPC_LINK`, otherwise undefined.
     * 
     * **maps:**`Integration.ConnectionId`
     */
    connection(type:Field<ConnectionType>,connectionId?:Field<string>):this
    connection(type:Field<ConnectionType>,connectionId?:Field<string>){
        this._.connection={
            type,
            id: connectionId
        }
        return this
    }
    /**
     * **required:false**
     * @param type Specifies how to handle request payload content type conversions. Valid
     * values are:
     * - `CONVERT_TO_BINARY`: Converts a request payload from a base64-encoded string to a
     *   binary blob.
     * - `CONVERT_TO_TEXT`: Converts a request payload from a binary blob to a base64-encoded
     *   string.
     * 
     * If this property isn't defined, the request payload is passed through from the method
     * request to the integration request without modification, provided that the
     * PassthroughBehaviors property is configured to support payload pass-through.
     * 
     * **maps:**`Integration.ContentHandling`
     */
    contentHandling(type:Field<ContentHandling>){
        this._.contentHandling=type
        return this
    }
    
    /**
     * **required:false**
     * @param passThrough The credentials that are required for the integration. To specify an
     * AWS Identity and Access Management (IAM) role that API Gateway assumes, specify the
     * role's Amazon Resource Name (ARN). To require that the caller's identity be passed
     * through from the request, specify arn:aws:iam::*:user/*.
     * 
     * To use resource-based permissions on the AWS Lambda (Lambda) function, don't specify
     * this property. Use the AWS::Lambda::Permission resource to permit API Gateway to call
     * the function. For more information, see Allow Amazon API Gateway to Invoke a Lambda
     * Function in the AWS Lambda Developer Guide.
     * 
     * **maps:**`Integration.Credentials`
     */
    credentials(passThrough:"arn:aws:iam::*:user/*"):this
    /**
     * **required:false**
     * @param role The credentials that are required for the integration. To specify * an AWS
     * Identity and Access Management (IAM) role that API Gateway assumes, * specify the
     * role's Amazon Resource Name (ARN). To require that the caller's * identity be passed
     * through from the request, specify `arn:aws:iam::*:user/*`.
     * 
     * To use resource-based permissions on the AWS Lambda (Lambda) function, don't specify
     * this property. Use the AWS::Lambda::Permission resource to permit API Gateway to call
     * the function. For more information, see Allow Amazon API Gateway to Invoke a Lambda
     * Function in the AWS Lambda Developer Guide.
     * 
     * **maps:**`Integration.Credentials`
     */
    credentials(role:Attr<Role>):this
    credentials(role:Attr<Role>){
        this._.credentials=Attr.get(role,"Arn")
        return this
    }
    /**
     * **required:false**
     * @param handlers The response that API Gateway provides after a method's backend completes
     * processing a request. API Gateway intercepts the response from the backend so that you
     * can control how API Gateway surfaces backend responses. For example, you can map the
     * backend status codes to codes that you define.
     * 
     * **maps:**`Integration.IntegrationResponses`
     */
    integrationResponse(...handlers:( Field<IntegrationResponseOut>|Method.IntegrationResponse)[]){
        this._.integrationResponses.push(...handlers)
        return this
    }
    /**
     * **required:false**
     * @param type Indicates when API Gateway passes requests to the targeted backend. This
     * behavior depends on the request's Content-Type header and whether you defined a mapping
     * template for it.
     * - `WHEN_NO_MATCH`: passes the request body for unmapped content types through to the
     *   integration back end without transformation.
     * - `NEVER`: rejects unmapped content types with an HTTP 415 'Unsupported Media Type'
     *   response.
     * - `WHEN_NO_TEMPLATES`: allows pass-through when the integration has NO content types
     *   mapped to templates. However if there is at least one content type defined, unmapped
     *   content types will be rejected with the same 415 response.
     * 
     * **maps:**`Integration.PassthroughBehavior`
     */
    passthrougBehavior(type:Field<PassthroughBehavior>){
        this._.passthrougBehavior=type
        return this
    }
    /**
     * The request parameters that API Gateway sends with the backend request. Specify request
     * parameters as key-value pairs (string-to-string mappings), with a destination as the
     * key and a source as the value.
     * 
     * **required:false**
     * 
     * **maps:**`Integration.RequestParameters`
     * @param dest Specify the destination by using the following pattern
     * integration.request.location.name, where location is query string, path, or header, and
     * name is a valid, unique parameter name.
     * @param source The source must be an existing method request parameter or a static
     * value. You must enclose static values in single quotation marks and pre-encode these
     * values based on their destination in the request.
     */
    requestParameterMapping(dest:string,source:Field<string>):this
    /**
     * The request parameters that API Gateway sends with the backend request. 
     * 
     * **required:false**
     * 
     * **maps:**`Integration.RequestParameters`
     * @param map Specify request parameters as key-value pairs (string-to-string mappings),
     * with a destination as the key and a source as the value.
     * - Specify the destination by using the following pattern
     *   integration.request.location.name, where location is query string, path, or header,
     *   and name is a valid, unique parameter name.
     * - The source must be an existing method request parameter or a static value. You must
     *   enclose static values in single quotation marks and pre-encode these values based on
     *   their destination in the request.
     */
    requestParameterMapping(map:SMap<Field<string>>):this
    requestParameterMapping(map:SMap<Field<string>>|string,source?:Field<string>){//TODO JSONPath 
        if(typeof map=="string"){
            this._.requestParametersMapping[map]=source
        }else{
            this._.requestParametersMapping=_.assign(map,this._.requestParametersMapping)
        }
        return this
    }
    /**
     * **required:false**
     * 
     * **maps:**`Integration.RequestTemplates`
     * @param contentType the content-type to apply the template to
     * @param template Apache Velocity templates that is applied on the request payload.
     */
    requestTemplateMapping(contentType:string,template:Field<string>):this
    /**
     * **required:false**
     * 
     * **maps:**`Integration.RequestTemplates`
     * @param map A map of Apache Velocity templates that are applied on the request payload.
     * The template that API Gateway uses is based on the value of the Content-Type header
     * that's sent by the client. The content type value is the key, and the template is the
     * value (specified as a string), such as the following snippet:
     * ```json
     * {
     *     "application/json": "{\n \"statusCode\": 200\n}"
     * }
     * ```
     */
    requestTemplateMapping(map:SMap<Field<string>>):this
    requestTemplateMapping(map:SMap<Field<string>>|string,template?:Field<string>){
        if(typeof map=="string"){
            this._.requestTemplateMapping[map]=template
        }else{
            this._.requestTemplateMapping=_.assign(map,this._.requestTemplateMapping)
        }
        return this
    }
    /**
     * **required:false**
     * @param ms Custom timeout between 50 and 29,000 milliseconds. The default value is
     * 29,000 milliseconds or 29 seconds.
     * 
     * **maps:**`Integration.TimeoutInMillis`
     */
    timeoutMs(ms:Field<number>){
        this._.timeoutMs=ms
        return this
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
        if(typeof this._.timeoutMs =="number"){
            if(this._.timeoutMs<50 || this._.timeoutMs>29_000){
                errors.push("the timeout must be between 50ms and 29'000ms")
            }
        }
        
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    public [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true)
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
    [generateObject]():MethodOut{
        return {
            Type:this[resourceIdentifier],
            Properties:{
                AuthorizationType:this._.authorization.type,
                AuthorizationScopes:this._.authorization.scopes,
                AuthorizerId:this._.authorization.authorizer,

                Integration:{
                    Credentials:this._.credentials,

                    CacheKeyParameters:notEmpty(this._.cacheParameters),
                    CacheNamespace:this._.cacheNS,

                    ConnectionType:this._.connection?.type,
                    ConnectionId:this._.connection?.id,

                    ContentHandling:this._.contentHandling,
                    PassthroughBehavior:this._.passthrougBehavior,
                    RequestParameters:notEmpty(this._.requestParametersMapping),
                    RequestTemplates:notEmpty(this._.requestTemplateMapping),

                    IntegrationResponses:notEmpty(this._.integrationResponses),


                    TimeoutInMillis:this._.timeoutMs,
                } as IntegrationOut,
                MethodResponses:this._.responses.size 
                    ? [...this._.responses.entries()].map(([code,{models,headers}]) => ({
                        ResponseModels:_.size(models) 
                            ? models 
                            : undefined,
                        ResponseParameters:_.size(headers) 
                            ? _.mapKeys(k => "method.response.header."+k, headers)
                            : undefined,
                        StatusCode:code
                    }))
                    : undefined,
                RequestModels:notEmpty(this._.requestModels),
                RequestParameters:notEmpty(this._.requestParameters),
                RequestValidatorId:this._.requestValidator,
                OperationName:this._.operationName,
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
import { OptionsMethod } from "./optionsMethod";
import { LambdaMethod } from "./lambdaMethod";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { RequestValidator } from "../requestValidator";
import { Role } from "../../iam";
import { IntegrationResponseOut, IntegrationResponse as _IntegrationResponse} from "./integrationResponse";
export namespace Method{
    //TODO add other types
    export const Option=OptionsMethod
    export type Option=OptionsMethod

    export const Lambda=LambdaMethod
    export type Lambda=LambdaMethod

    export const IntegrationResponse=_IntegrationResponse
    export type IntegrationResponse=_IntegrationResponse
}
export type PassthroughBehavior = "WHEN_NO_MATCH" | "NEVER" | "WHEN_NO_TEMPLATES";
export type ConnectionType = "INTERNET" | "VPC_LINK";
export type ContentHandling = "CONVERT_TO_BINARY" | "CONVERT_TO_TEXT";
export type AuthorizationType="NONE"|"AWS_IAM"|"CUSTOM"|"COGNITO_USER_POOLS";
export type IntegrationType="AWS"|"AWS_PROXY"|"HTTP"|"HTTP_PROXY"|"MOCK";
export type ParameterLocation="querystring"|"path"|"header"
/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apitgateway-method-integration.html)
 */
export interface IntegrationOut{
    Type:Field<IntegrationType>; //Managed by sub implementations
    CacheKeyParameters ?: Field<string>[]
    CacheNamespace ?: Field<string>
    ConnectionId ?: Field<string>
    ConnectionType ?: Field<string>
    ContentHandling ?: Field<string>
    Credentials ?: Field<string>
    IntegrationHttpMethod ?: Field<string> //Managed by sub implementations
    IntegrationResponses ?: Field<IntegrationResponseOut>[]
    PassthroughBehavior ?: Field<string>
    RequestParameters ?: SMap<Field<string>>
    RequestTemplates ?: SMap<Field<string>>
    TimeoutInMillis ?: Field<number>
    Uri ?: Field<string> //Managed by sub implementations
}
/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apitgateway-method-methodresponse.html)
 */
interface MethodResponse{
    models?:SMap<Field<string>>;
    headers?:SMap<Field<boolean>>;
}

interface Authorization{
    type:string,
    authorizer?:Field<string>,
    scopes?:Field<string>[]
}
export interface MethodOut{
    Type: string
    Properties: {
        OperationName: Field<string>
        ApiKeyRequired: Field<boolean>

        AuthorizationType: Field<string>
        AuthorizationScopes?: Field<string>[]
        AuthorizerId: Field<string>

        Integration: IntegrationOut

        MethodResponses: {
            ResponseModels: SMap<Field<string>>
            ResponseParameters: SMap<Field<boolean>>
            StatusCode: Field<string>
        }[];

        RequestModels?:SMap<Field<string>>
        RequestParameters?:SMap<Field<boolean>>
        RequestValidatorId?:Field<string>

        HttpMethod: Field<string>
        ResourceId: Field<string>
        RestApiId: Field<string>
    }
}