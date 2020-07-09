import { Resource } from "aws-cf-builder-core/generatables/resource";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { resourceIdentifier, generateObject, checkValid, prepareQueue, checkCache } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
import { Field } from "aws-cf-builder-core/field";
import { callOnCheckValid, prepareQueueBase, callOnPrepareQueue, findInPath } from "aws-cf-builder-core/util";
import { Api } from "./api";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

export class RequestValidator extends Resource{
    [resourceIdentifier]="AWS::ApiGateway::RequestValidator"
    private _:{
        name:Field<string>
        validateBody:Field<boolean>
        validateParameters:Field<boolean>

        apiId:Field<string>
    }={} as any
    /**
     * returns the ID of the request validator, such as abc123.
     */
    r:ReferenceField
    constructor(){
        super(2)
    }
    /**
     * **required:false**
     * @param name The name of this request validator.
     * 
     * **maps:**`Name`
     */
    name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:false**
     * @param bool Indicates whether to validate the request body according to 
     * the configured schema for the targeted API and method.
     * 
     * **maps:**`ValidateRequestBody`
     */
    validateBody(bool:Field<boolean>=true){
        this._.validateBody=bool
        return this
    }
    /**
     * **required:false**
     * @param bool Indicates whether to validate request parameters.
     * 
     * **maps:**`ValidateRequestParameters`
     */
    validateParameters(bool:Field<boolean>=true){
        this._.validateParameters=bool
        return this
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Name:this._.name,
                ValidateRequestBody:this._.validateBody,
                ValidateRequestParameters:this._.validateParameters,

                RestApiId:this._.apiId
            }
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOnCheckValid(this._,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,path,true)
            const {api}=findInPath(path,{api:Api})
            if(!api) throw new PreparableError(this,"api not found in path")
            this._.apiId=api.obj.r
        }
    }

}