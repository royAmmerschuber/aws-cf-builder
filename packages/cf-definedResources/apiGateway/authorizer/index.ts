import _ from "lodash/fp";
import { SMap, PreparableError, Preparable } from "aws-cf-builder-core/general";
import { Field } from "aws-cf-builder-core/field";
import { ResourceError } from "aws-cf-builder-core/general";
import { pathItem, namedPath } from "aws-cf-builder-core/path";
import { checkValid, generateObject, checkCache } from "aws-cf-builder-core/symbols";
import { stacktrace, prepareQueue } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { findInPath, prepareQueueBase, callOn } from "aws-cf-builder-core/util";
import { Api } from "../api";
import { resourceIdentifier } from "aws-cf-builder-core/symbols";
import { pathName } from "aws-cf-builder-core/symbols";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

/**
 * The AWS::ApiGateway::Authorizer resource creates an authorization 
 * layer that Amazon API Gateway (API Gateway) activates for methods 
 * that have authorization enabled. API Gateway activates the 
 * authorizer when a client calls those methods.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html)
 */
export abstract class Authorizer extends Resource implements namedPath{
    readonly [resourceIdentifier] ="AWS::ApiGateway::Authorizer";

    //#region parameters
    protected _:{
        identitySource:Field<string>,
        type:Field<"TOKEN"|"COGNITO_USER_POOLS"|"REQUEST">,
        crdentials: Field<string>,
        resultTtl: Field<number>,
        providers:Field<string>[],

        restApiId:Field<string>
    }={
        providers:[]
    } as any
    //#endregion
    /**
     * the authorizer's ID, such as `abcde1`.
     */
    r:ReferenceField
    /**
     * @param name The name of the authorizer.
     * 
     * **maps:** `Name`
     */
    constructor(
        private name:Field<string>,
        eDepth:number
    ){super(++eDepth);}

    //#region simple properties
    /**
     * **required: true**
     * 
     * **maps:** `IdentitySource`
     * @param src The source of the identity in an incoming request.
     * 
     * If you specify TOKEN or COGNITO_USER_POOLS for the Type property, 
     * specify a header mapping expression using the form 
     * `method.request.header.name`, where name is the name of a custom 
     * authorization header that clients submit as part of their requests.
     * 
     * If you specify REQUEST for the Type property, specify a 
     * comma-separated string of one or more mapping expressions of the 
     * specified request parameter using the form 
     * `method.request.parameter.name`. For supported parameter types, see 
     * Configure Lambda Authorizer Using the API Gateway Console in the 
     * API Gateway Developer Guide.
     */
    public IdentitySource(src:Field<string>):this{
        this._.identitySource=src;
        return this;
    }

    /**
     * **required:false**
     * 
     * **maps:** `AuthorizerResultTtlInSeconds`
     * @param ttl The time-to-live (TTL) period, in seconds, that specifies 
     * how long API Gateway caches authorizer results. If you specify a 
     * value greater than 0, API Gateway caches the authorizer responses. 
     * By default, API Gateway sets this property to 300. The maximum value 
     * is 3600, or 1 hour.
     */
    public ttl(ttl:Field<number>):this{
        this._.resultTtl=ttl;
        return this;
    }
    //#endregion
    
    //#region resource functions
    public [checkValid]() {
        if(this[checkCache]){
            return this[checkCache]
        }
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.identitySource){
            errors.push("you must specify an IdentitySource");
        }
        if(!this._.type){
            errors.push("you must specify a Type");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOn([this._, this.name],Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    public [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn([this._, this.name],Preparable as any,(o:Preparable)=>{
                o[prepareQueue](stack,this,true)
            })

            const {api}=findInPath(path,{api:Api})
            if(!api) throw new PreparableError(this,"api not found in path")
            this._.restApiId=api.obj.r
        }
    }
    public [generateObject]() {
        
        return {
            Type:this[resourceIdentifier],
            Properties:{
                IdentitySource: this._.identitySource,
                Name: this.name,
                Type: this._.type,
                ProviderARNs: this._.providers.length ? this._.providers : undefined,
                RestApiId:this._.restApiId,
                AuthorizerResultTtlInSeconds:this._.resultTtl
            }
        };
    }
    public [pathName](){
        if(typeof this.name=="string"){
            return _.capitalize(this.name)
        }
        return ""
    }
    //#endregion
}
import { CognitoAuthorizer } from "./cognitoAuthorizer";
export namespace Authorizer{
    export const Cognito=CognitoAuthorizer
}