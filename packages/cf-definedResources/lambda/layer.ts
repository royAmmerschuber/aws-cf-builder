import _ from "lodash/fp"
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { runtimes } from "./function";
import { Field } from "aws-cf-builder-core/field";
import { s3PathConverter } from "../util";
import { PreparableError, SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { resourceIdentifier, checkValid, stacktrace, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { callOn, prepareQueueBase } from "aws-cf-builder-core/util";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { LayerPermission } from "./layerPermission";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

/**
 * The AWS::Lambda::LayerVersion resource creates a layer version in AWS 
 * Lambda. For more information, see AWS Lambda Layers in the AWS Lambda 
 * Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-layerversion.html)
 */
export class Layer extends Resource{
    readonly [resourceIdentifier]="AWS::Lambda::LayerVersion"
    
    //#region parameters
    private _:{
        content:{
            S3Bucket:Field<string>
            S3Key:Field<string>
            S3ObjectVersion?:Field<string>
        }
        description: Field<string>
        license: Field<string>
        runtimes: Field<runtimes>[]
        name:Field<string>
    }={
        runtimes:[]
    } as any

    private permissions:LayerPermission[]=[];
    //#endregion
    /**
     * the ARN of the layer version, such as `arn:aws:lambda:us-west-2:123456789012:layer:my-layer:1`.
     */
    r:ReferenceField
    a={
        /**
         * the ARN of the layer version, such as `arn:aws:lambda:us-west-2:123456789012:layer:my-layer:1`.
         */
        Arn:this.r
    }
    constructor(){ super(1) }
    /**
     * **required:false**
     * 
     * **maps:**`LayerName`
     * @param name The name of the layer.
     */
    name(name:Field<string>){
        this._.name=name
        return this;
    }
    //#region simple properties
    /**
     * The function layer archive.
     * 
     * **required:true**
     * 
     * **maps:** `Content`
     * @param s3Url s3 path to the code archive
     */
    Content(s3Url:string):this;
    /**
     * @param bucket The Amazon S3 bucket of the layer archive.
     * 
     * **maps:** `Content.S3Bucket`
     * @param key The Amazon S3 key of the layer archive.
     * 
     * **maps:** `Content.S3Key`
     * @param version For versioned objects, the version of the layer 
     * archive object to use.
     * 
     * **maps:** `Content.S3ObjectVersion`
     */
    Content(bucket:Field<string>,key:Field<string>,version?:Field<string>):this;
    Content(bu:Field<string>,key?:Field<string>,version?:Field<string>):this{
        if(key){
            this._.content={
                S3Bucket:bu,
                S3Key:key,
                S3ObjectVersion:version
            }
        }else{
            if(typeof bu != "string") throw new PreparableError(this,"you must specify a key to your bucket")

            const c=s3PathConverter(bu);
            if(!c.key) throw new Error("must contain key");
            this._.content={
                S3Bucket:c.bucket,
                S3Key:c.key,
                S3ObjectVersion:c.version
            }
        }
        return this;
    }
    /**
     * **required:false**
     * @param description The description of the version.
     * 
     * **maps:** `Description`
     */
    description(description:Field<string>){
        this._.description=description;
        return this;
    }
    /**
     * **required:false**
     * @param license The layer's software license. It can be either 
     * of the following:
     * - An SPDX license identifier. For example, MIT.
     * - The URL of a license hosted on the internet. For example, 
     * https://opensource.org/licenses/MIT.
     * 
     * **maps:** `LicenseInfo`
     */
    license(license:Field<string>){
        this._.license=license;
        return this;
    }
    /**
     * **required:false**
     * @param runtimes A list of compatible function runtimes.
     * 
     * **maps:** `CompatibleRuntimes`
     */
    runtimes(...runtimes:Field<runtimes>[]){
        this._.runtimes.push(...runtimes);
        return this;
    }
    //#endregion
    
    //#region sub resources
    /**
     * **required:false**
     * @param permissions the permissions to add to this layer
     */
    permission(...permissions:LayerPermission[]){
        this.permissions.push(...permissions);
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]

        const out:SMap<ResourceError>={};
        const errors:string[]=[]
        if(!this._.content){
            errors.push("you must specify the content of this layer");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOn([
            this._,
            this.permissions
        ],Preparable as any,(o:Preparable)=>o[checkValid]()).reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack: stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable as any,(o:Preparable)=> o[prepareQueue](stack,this,true));
            this.permissions.forEach(o=>o[prepareQueue](stack,this,false))
        }
    }
    public [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                LayerName:this._.name,
                Content:this._.content,
                Description:this._.description,
                LicenseInfo:this._.license,
                CompatibleRuntimes:this._.runtimes.length ? this._.runtimes : undefined
            }
        }
    }
    //#endregion 
}

