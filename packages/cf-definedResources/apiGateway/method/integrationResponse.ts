import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
import _ from "lodash/fp";
import { ContentHandling } from ".";
import { notEmpty, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";

/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apitgateway-method-integration-integrationresponse.html)
 */
export interface IntegrationResponseOut{
    ContentHandling ?: Field<string>,
    ResponseParameters ?: SMap<Field<string>>,
    ResponseTemplates ?: SMap<Field<string>>,
    SelectionPattern ?: Field<string>,
    StatusCode : Field<string>
}

export class IntegrationResponse extends InlineAdvField<IntegrationResponseOut>{
    [resourceIdentifier]="IntegrationResponse";
    private _: { 
        statusCode: Field<string>
        selectionPattern: Field<string>
        contentHandling: Field<ContentHandling>
        parameterMapping: SMap<Field<string>>
        templateMapping: SMap<Field<string>>
    }={
        parameterMapping: {},
        templateMapping: {},
    } as any
    constructor(){
        super(1)
    }

    /**
     * **required:true**
     * @param code The status code that API Gateway uses to map the integration response 
     * to a MethodResponse status code.
     * 
     * **maps:**`StatusCode`
     */
    StatusCode(code:Field<string>){
        this._.statusCode=code
        return this
    }
    /**
     * **required:false**
     * @param regex A regular expression that specifies which error strings or status 
     * codes from the backend map to the integration response.
     * 
     * **maps:**`SelectionPattern`
     */
    selectionPattern(regex:Field<string>|RegExp){
        if(regex instanceof RegExp){
            this._.selectionPattern=regex.source
        }else{
            this._.selectionPattern=regex
        }
        return this
    }
    /**
     * **required:false**
     * @param type Specifies how to handle request payload content type conversions. Valid
     * values are:
     * - `CONVERT_TO_BINARY`: Converts a request payload from a base64-encoded string to a
     *   binary blob.
     * - `CONVERT_TO_TEXT`: Converts a request payload from a binary blob to a
     *   base64-encoded string.
     * 
     * If this property isn't defined, the request payload is passed through from the
     * method request to the integration request without modification.
     * 
     * **maps:**`ContentHandling`
     */
    contentHandling(type:Field<ContentHandling>){
        this._.contentHandling=type
        return this
    }
    /**
     * The response parameters from the backend response that API Gateway sends to the
     * method response. Specify response parameters as key-value pairs (string-to-string
     * mappings).
     * 
     * For more information about templates, see API Gateway Mapping Template and Access
     * Logging Variable Reference in the API Gateway Developer Guide.
     * 
     * **required:false**
     * 
     * **maps:**`ResponseParameters`
     * @param dest The destination must be an existing response parameter in the
     * MethodResponse property.
     * @param source The source must be an existing method request parameter or a static
     * value. You must enclose static values in single quotation marks and pre-encode
     * these values based on the destination specified in the request.
     */
    parameterMapping(dest:string,source:Field<string>):this //TODO JSONPath
    /**
     * The response parameters from the backend response that API Gateway sends to the
     * method response. Specify response parameters as key-value pairs (string-to-string
     * mappings).
     * 
     * For more information about templates, see API Gateway Mapping Template and Access
     * Logging Variable Reference in the API Gateway Developer Guide.
     * 
     * **required:false**
     * 
     * **maps:**`ResponseParameters`
     * @param map Use the destination as the key and the source as the value:
     * - The destination must be an existing response parameter in the MethodResponse
     *   property.
     * - The source must be an existing method request parameter or a static value. You
     *   must enclose static values in single quotation marks and pre-encode these values
     *   based on the destination specified in the request.
     */
    parameterMapping(map:SMap<Field<string>>):this
    parameterMapping(dm:SMap<Field<string>>|string,source?:Field<string>){
        if(typeof dm =="string"){
            this._.parameterMapping[dm]=source
        }else{
            this._.parameterMapping=_.assign(dm,this._.parameterMapping)
        }
        return this
    }
    /**
     * The templates that are used to transform the integration response body. 
     * 
     * For more information, see API Gateway Mapping Template and Access Logging Variable
     * Reference in the API Gateway Developer Guide.
     * 
     * **required:false**
     * 
     * **maps:**`ResponseTemplates`
     * @param contentType the content type to apply the template to
     * @param template the template to apply
     */
    templateMapping(contentType:string,template:Field<string>):this
    /**
     * The templates that are used to transform the integration response body. 
     * 
     * For more information, see API Gateway Mapping Template and Access Logging Variable
     * Reference in the API Gateway Developer Guide.
     * 
     * **required:false**
     * 
     * **maps:**`ResponseTemplates`
     * @param map a map, with a content type as the key and a template as the value.
     */
    templateMapping(map:SMap<Field<string>>):this
    templateMapping(dm:SMap<Field<string>>|string,source?:Field<string>){
        if(typeof dm =="string"){
            this._.templateMapping[dm]=source
        }else{
            this._.templateMapping=_.assign(dm,this._.templateMapping)
        }
        return this
    }
    toJSON():IntegrationResponseOut{
        return {
            ContentHandling:this._.contentHandling,
            ResponseParameters:notEmpty(this._.parameterMapping),
            ResponseTemplates:notEmpty(this._.templateMapping),
            StatusCode:this._.statusCode,
            SelectionPattern:this._.selectionPattern
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const errors:string[]=[]
        if(!this._.statusCode){
            errors.push("StatusCode must be set")
        }
        const out:SMap<ResourceError>={}
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }

}