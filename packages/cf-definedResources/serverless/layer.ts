import { Resource } from "aws-cf-builder-core/generatables/resource";
import { generateObject, resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { runtimes } from "../lambda/function";
import { Field } from "aws-cf-builder-core/field";
import { LayerPermission } from "../lambda";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { prepareQueueBase, notEmpty, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
import _ from "lodash/fp";

export type retentionPolicy = "Retain" | "Delete";

export class ServerlessLayer extends Resource {
    [resourceIdentifier] = "AWS::Serverless::LayerVersion";
    private _: {
        contentUri: {
            Bucket: Field<string>,
            Key: Field<string>,
            Version: Field<string>
        } | Field<string>
        runtimes: Field<runtimes>[],
        name: Field<string>,
        description: Field<string>,
        license: Field<string>,
        retentionPolicy: Field<retentionPolicy>
    }={
        runtimes:[]
    } as any
    private permissions: LayerPermission[] = []
    /**
     * the resource ARN of the underlying Lambda LayerVersion
     */
    r: ReferenceField
    a = {
        /**
         * the resource ARN of the underlying Lambda LayerVersion
         */
        Arn: this.r
    }
    constructor() {
        super(1)
    }
    /**
     * The function layer archive.
     * 
     * **required:true**
     * 
     * **maps:** `Content`
     * @param url s3 path to the code archive or local path to code folder
     */
    Content(url: Field<string>): this;
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
    Content(bucket: Field<string>, key: Field<string>, version?: Field<string>): this;
    Content(bu: Field<string>, key?: Field<string>, version?: Field<string>): this {
        if (key) {
            this._.contentUri = {
                Bucket: bu,
                Key: key,
                Version: version
            }
        } else {
            this._.contentUri = bu
        }
        return this;
    }
    /**
     * **required:false**
     * 
     * **maps:**`LayerName`
     * @param name The name of the layer.
     */
    name(name: Field<string>) {
        this._.name = name
        return this;
    }
    /**
     * **required:false**
     * @param description The description of the version.
     * 
     * **maps:** `Description`
     */
    description(description: Field<string>) {
        this._.description = description;
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
    license(license: Field<string>) {
        this._.license = license;
        return this;
    }
    /**
     * **required:false**
     * @param runtimes A list of compatible function runtimes.
     * 
     * **maps:** `CompatibleRuntimes`
     */
    runtimes(...runtimes: Field<runtimes>[]) {
        this._.runtimes.push(...runtimes);
        return this;
    }

    retentionPolicy(policy: Field<retentionPolicy>) {
        this._.retentionPolicy = policy
        return this;
    }
    permission(...permissions: LayerPermission[]) {
        this.permissions.push(...permissions);
        return this;
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]

                const out:SMap<ResourceError>={};
        const errors:string[]=[]
        if(!this._.contentUri){
            errors.push("you must specify the content of this layer");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOnCheckValid([
            this._,
            this.permissions
        ],out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true);
            this.permissions.forEach(o=>o[prepareQueue](stack,this,false))
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                LayerName:this._.name,
                ContentUri:this._.contentUri,
                Description:this._.description,
                LicenseInfo:this._.license,
                CompatibleRuntimes:notEmpty(this._.runtimes),
                RetentionPolicy:this._.retentionPolicy
            }
        }

    }
}