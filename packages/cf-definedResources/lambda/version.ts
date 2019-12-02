import { resourceIdentifier, pathName, checkValid, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Field, isAdvField } from "aws-cf-builder-core/field";
import { Preparable, PreparableError } from "aws-cf-builder-core/general";
import { callOn, prepareQueueBase, findInPath } from "aws-cf-builder-core/util";
import _ from "lodash/fp"
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, namedPath, PathDataCarrier } from "aws-cf-builder-core/path";
import { LambdaFunction } from "./function";
import { Alias } from "./alias";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { EventMapping } from "./eventMapping";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

/**
 * The AWS::Lambda::Version resource publishes a specified version of 
 * an AWS Lambda (Lambda) function. When publishing a new version of 
 * your function, Lambda copies the latest version of your function. 
 * For more information, see Introduction to AWS Lambda Versioning in 
 * the AWS Lambda Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-version.html)
 */
export class Version extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::Lambda::Version"
    //#region parameters
    private _:{
        sha:Field<string>,
        description:Field<string>,
        functionName:Field<string>
    }={} as any

    private aliases:{alias:Alias,weight?:Field<number>}[]=[];
    private eventMappings:EventMapping[]=[];

    /**
     * the ARN of the version, such as `arn:aws:lambda:us-west-2:123456789012:function:helloworld:1`.
     */
    r:ReferenceField
    a={
        /**
         * The version number.
         */
        Version:new AttributeField(this,"Version"),
        /**
         * the ARN of the version, such as `arn:aws:lambda:us-west-2:123456789012:function:helloworld:1`.
         */
        Arn:this.r
    }
    //#endregion
    /**
     * 
     * @param description A description of the version you are publishing. 
     * If you don't specify a value, Lambda copies the description from 
     * the $LATEST version of the function.
     * 
     * **maps:** `Description`
     * @param useDesc if the description should be used
     */
    constructor(){ super(1) }
    description(text:Field<string>){
        this._.description=text
        return this;
    }
    //#region simple props
    /**
     * **required:false**
     * @param sha The SHA-256 hash of the deployment package that you 
     * want to publish. This value must match the SHA-256 hash of the 
     * $LATEST version of the function. Specify this property to 
     * validate that you are publishing the correct package.
     * 
     * **maps:** `CodeSha256`
     */
    codeSha(sha:Field<string>){
        this._.sha=sha;
        return this;
    }
    //#endregion

    //#region subresources
    /**
     * adds an alias to this version
     * 
     * **required:false**
     * @param alias the alias to add to this version
     * @param weight a weight to associate with this version. one of the 
     * versions must not have a weight assignt to it for it to work
     */
    alias(alias:Alias,weight?:Field<number>){
        this.aliases.push({
            alias: alias,
            weight: weight
        });
        return this;
    }
    /**
     * **required:false**
     * @param eventMappings adds an event mapping
     */
    eventMapping(...eventMappings:EventMapping[]){
        this.eventMappings.push(...eventMappings);
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        if(this[checkCache])return this[checkCache]

        return this[checkCache]=callOn([
            this._,
            this.eventMappings,
            this.aliases
        ],Preparable as any,(o:PreparableError)=>o[checkValid]()).reduce(_.assign,{});
    }
    [prepareQueue](stack: stackPreparable, path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))
            
            this.eventMappings.forEach(v=>v[prepareQueue](stack,this,false))
            this.aliases.forEach(v=>v.alias[prepareQueue](stack,new PathDataCarrier(this,{
                versionWeight:v.weight || null
            }),false))

            const { func }=findInPath(path,{func:LambdaFunction})

            if(!func) throw new PreparableError(this,"function not found in path")
            this._.functionName=func.obj.r
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                FunctionName:this._.functionName,
                Description:this._.description,
                CodeSha256:this._.sha
            }
        }
    }
    [pathName](){
        if(isAdvField(this._.description))return ""
        return this._.description || ""
    }
    //#endregion
}