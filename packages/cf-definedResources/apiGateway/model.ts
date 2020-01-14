import _ from "lodash/fp";

import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { resourceIdentifier, checkValid, stacktrace, prepareQueue, generateObject, checkCache, pathName } from "aws-cf-builder-core/symbols";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Field } from "aws-cf-builder-core/field";
import { SMap, PreparableError } from "aws-cf-builder-core/general";
import { ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, namedPath } from "aws-cf-builder-core/path";
import { prepareQueueBase, callOnPrepareQueue, callOnCheckValid } from "aws-cf-builder-core/util";
import { findInPath } from "aws-cf-builder-core/util";
import { Api } from "./api";

/**
 * The AWS::ApiGateway::Model resource defines the structure of a request 
 * or response payload for an Amazon API Gateway (API Gateway) method.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-model.html)
 */
export class Model extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::ApiGateway::Model";

    //#region parameters
    private _:{
        type:Field<string>,
        schema:Field<any>,
        description:Field<string>

        restApiId:Field<string>
    }={ } as any
    //#endregion
    /**
     * the model name, such as `myModel`
     */
    r:ReferenceField
    /**
     * @param name A name for the model. this also gets used to generate the logical Id
     * @param useName If disabled, AWS 
     * CloudFormation generates a unique physical ID and uses that ID for 
     * the model name. For more information, see Name Type.
     * >**Important**
     * >
     * > If you enable this, you cannot perform updates that require replacement 
     * > of this resource. You can perform updates that require no or some 
     * > interruption. If you must replace the resource, specify a new name.
     */
    constructor(
        private name:Field<string>,
        private useName:boolean=false
    ){
        super(2);
    }

    //#region simple properties

    /**
     * 
     * **required:true**
     * 
     * **maps:** `ContentType`
     * @param type The content type for the model.
     */
    Type(type:Field<string>):this{
        this._.type=type;
        return this;
    }

    /**
     * **required:true**
     * 
     * **maps:** `Schema`
     * @param shema The schema to use to transform data to one or 
     * more output formats. Specify null ({}) if you don't want 
     * to specify a schema.
     */
    Shema(shema:Field<any>):this{
        this._.schema=shema;
        return this;
    }

    /**
     * **required:false**
     * 
     * **maps:** `Description`
     * @param description A description that identifies this model.
     */
    description(description:Field<string>):this{
        this._.description=description;
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
        if(!this._.schema){
            errors.push("you must specify a Schema");
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
        return this[checkCache]=callOnCheckValid([this._,this.name],out);
    }
    public [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue([this._, this.name],stack,this,true)

            const { api }=findInPath(path,{api:Api})
            if(!api) throw new PreparableError(this,"api not found in path")
            this._.restApiId=api.obj.r
        }
    }
    public [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                ContentType:this._.type,
                Schema:this._.schema,
                Description:this._.description,
                Name:this.useName ? this.name : undefined,
                RestApiId:this._.restApiId
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