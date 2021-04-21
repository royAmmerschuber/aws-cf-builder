import _ from "lodash/fp";

import { checkValid, prepareQueue, resourceIdentifier, stacktrace, generateObject, pathName, checkCache } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";

import { LambdaFunction } from "./function";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Attr, prepareQueueBase, findInPath, callOnPrepareQueue, callOnCheckValid } from "aws-cf-builder-core/util";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, namedPath } from "aws-cf-builder-core/path";
import { ServerlessFunction } from "../serverless/function";

/**
 * The AWS::Lambda::Permission resource associates a policy statement with 
 * a specific AWS Lambda (Lambda) function's access policy. The function 
 * policy grants a specific AWS service or application permission to 
 * invoke the function. For more information, see AddPermission in the AWS 
 * Lambda Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-permission.html)
 */
export class Permission extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::Lambda::Permission";

    //#region parameters
    private _:{
        action:Field<string>,
        principal:Field<string>,
        srcAccount:Field<string>,
        srcArn:Field<string>,
        srcToken:Field<string>,

        functionName:Field<string>
    }={} as any
    //#endregion

    /**
     * @param name used only for logicalId
     */
    constructor(
        private name:string="main"
    ){super(1)}

    //#region simple properties
    /**
     * **required:true**
     * 
     * **maps:** `Action`
     * @param action The Lambda actions that you want to allow in this 
     * statement. For example, you can specify lambda:CreateFunction to 
     * specify a certain action, or use a wildcard (lambda:*) to grant 
     * permission to all Lambda actions. For a list of actions, see 
     * Actions and Condition Context Keys for AWS Lambda in the IAM User 
     * Guide.
     */
    Action(action:Field<string>):this{
        this._.action=action;
        return this;
    }

    /**
     * **required:true**
     * 
     * **maps:** `Principal`
     * @param principal The entity for which you are granting permission to 
     * invoke the Lambda function. This entity can be any valid AWS service 
     * principal, such as s3.amazonaws.com or sns.amazonaws.com, or, if you 
     * are granting cross-account permission, an AWS account ID. For example, 
     * you might want to allow a custom application in another AWS account to 
     * push events to Lambda by invoking your function.
     */
    Principal(principal:Field<string>):this{
        this._.principal=principal;
        return this;
    }

    /**
     * **required:false**
     * @param val The ARN of a resource that is invoking your function. 
     * When granting Amazon Simple Storage Service (Amazon S3) permission 
     * to invoke your function, specify this property with the bucket ARN 
     * as its value. This ensures that events generated only from the 
     * specified bucket, not just any bucket from any AWS account that 
     * creates a mapping to your function, can invoke the function.
     * 
     * > **Important**
     * > 
     * > This property is not supported by all event sources. For more 
     * > information, see the SourceArn parameter for the AddPermission 
     * > action in the AWS Lambda Developer Guide.
     * 
     * **maps:** `SourceArn`
     */
    sourceArn(val:Attr<"Arn">){
        this._.srcArn=Attr.get(val,"Arn")
        return this;
    }
    /**
     * **required:false**
     * @param id The AWS account ID (without hyphens) of the source 
     * owner. For example, if you specify an S3 bucket in the SourceArn 
     * property, this value is the bucket owner's account ID. You can use 
     * this property to ensure that all source principals are owned by a 
     * specific account.
     * 
     * > **Important**
     * >
     * > This property is not supported by all event sources. For more 
     * > information, see the SourceAccount parameter for the AddPermission 
     * > action in the AWS Lambda Developer Guide.
     * 
     * **maps:** `SourceAccount`
     */
    sourceAccount(val:Field<string>){
        this._.srcAccount=val;
        return this;
    }
    /**
     * **required:false**
     * @param val A unique token that must be supplied by the principal 
     * invoking the function.
     * 
     * **maps:** `EventSourceToken`
     */
    sourceToken(val:Field<string>){
        this._.srcToken=val;
        return this;
    }
    //#endregion

    //#region resource functions
    public [checkValid]() {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.action){
            errors.push("you must specify an Action");
        }
        if(!this._.principal){
            errors.push("you must specify a Principal");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    public [prepareQueue](stack: stackPreparable, path:pathItem,ref:boolean) {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true)
            const found =findInPath(path,{
                lambda:LambdaFunction,
                sLambda:ServerlessFunction
            })
            if(_.size(found)==0){
                throw new PreparableError(this,"Lambda Function not found in path")
            }
            const first=_.sortBy("depth",found)[0].obj
            this._.functionName=first.r
        }
    }
    public [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Action:this._.action,
                FunctionName:this._.functionName,
                Principal:this._.principal,
                EventSourceToken:this._.srcToken,
                SourceAccount:this._.srcAccount,
                SourceArn:this._.srcArn
            }
        }
    }
    public [pathName](){
        return this.name;
    }
    //#endregion
}