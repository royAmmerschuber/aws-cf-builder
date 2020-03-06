import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { resourceIdentifier,checkCache,checkValid,prepareQueue, stacktrace} from "aws-cf-builder-core/symbols"
import { callOnCheckValid, callOnPrepareQueue, notEmpty } from "aws-cf-builder-core/util";

export interface CorsRuleOut {
    AllowedHeaders?: Field<string>[]
    AllowedMethods: Field<string>[]
    AllowedOrigins: Field<string>[]
    ExposedHeaders?: Field<string>[]
    Id?: Field<string>
    MaxAge?: Field<number>
}
//TODO
export class CorsRule extends InlineAdvField<CorsRuleOut>{
    [resourceIdentifier]="CorsRule"
    private _:{
        age:Field<number>
        id:Field<string>
        headers:Field<string>[]
        methods:Field<string>[]
        origins:Field<string>[]
        exposedHeaders:Field<string>[]
    }={
        headers:[],
        methods:[],
        origins:[],
        exposedHeaders:[]
    } as any
    constructor(){
        super(1)
    }
    /**
     * **required:false**
     * @param id A unique identifier for this rule. The value must be no more than 255 characters.
     * 
     * **maps:**`Id`
     */
    id(id:Field<string>){
        this._.id=id
        return this
    }

    /**
     * **required:false**
     * @param age The time in seconds that your browser is to cache the preflight response for the specified
     * resource.
     * 
     * **maps:**`MaxAge`
     */
    maxAge(age:Field<number>){
        this._.age=age
        return this
    }

    /**
     * **required:false**
     * @param headers Headers that are specified in the Access-Control-Request-Headers header. These headers are
     * allowed in a preflight OPTIONS request. In response to any preflight OPTIONS request, Amazon S3 returns
     * any requested headers that are allowed.
     * 
     * **maps:**`AllowedHeaders`
     */
    allowedHeaders(...headers:Field<string>[]){
        this._.headers.push(...headers)
        return this
    }

    /**
     * **required:true**
     * @param methods An HTTP method that you allow the origin to execute. Valid values are GET, PUT, HEAD, POST,
     * and DELETE.
     * 
     * **maps:**`AllowedMethods`
     */
    allowedMethods(...methods:Field<CorsMethod>[]){
        this._.methods.push(...methods)
        return this
    }
    /**
     * **required:true**
     * @param origins One or more origins you want customers to be able to access the bucket from.
     * 
     * **maps:**`AllowedOrigins`
     */
    allowedOrigins(...origins:Field<string>[]){
        this._.origins.push(...origins)
        return this
    }
    /**
     * **required:false**
     * @param headers One or more headers in the response that you want customers to be able to access from their
     * applications (for example, from a JavaScript XMLHttpRequest object).
     * 
     * **maps:**`ExposedHeaders`
     */
    exposedHeaders(...headers:Field<string>[]){
        this._.exposedHeaders.push(...headers)
        return this
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]

        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if(!this._.methods.length){
            errors.push("you need to specify at least one method")
        }
        if(!this._.origins.length){
            errors.push("you need to specify at least one origin")
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors: errors
            };
        }
        return this[checkCache] = callOnCheckValid(this._, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }
    toJSON():CorsRuleOut {
        return {
            AllowedMethods:this._.methods,
            AllowedOrigins:this._.origins,
            AllowedHeaders:notEmpty(this._.headers),
            ExposedHeaders:notEmpty(this._.exposedHeaders),
            Id:this._.id,
            MaxAge:this._.age
        }
    }    
}
export type CorsMethod="GET"|"PUT"|"HEAD"|"POST"|"DELETE"