import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { resourceIdentifier, checkCache, checkValid, prepareQueue, stacktrace } from "aws-cf-builder-core/symbols"
import { Tag } from "../../util";
import { notEmpty, Attr, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
import { Bucket } from ".";

export interface AnalyticsConfigOut {
    Id: Field<string>,
    Prefix: Field<string>,
    StorageClassAnalysis: {
        DataExport: {
            Destination: {
                BucketAccountId: Field<string>,
                BucketArn: Field<string>,
                Format: Field<string>,
                Prefix: Field<string>
            }
            OutputSchemaVersion: Field<string>
        }
    }
    TagFilters?: Tag[]
}
export type ExportFormat="CSV"
export type SchemaVersion="V_1"
//TODO
export class AnalyticsConfig extends InlineAdvField<AnalyticsConfigOut>{
    [resourceIdentifier] = "AnalyticsConfig"
    private _:{
        id:Field<string>
        prefix:Field<string>
        tagFilters:Tag[]
        bucket:Field<string>
        outPath:Field<string>
        outAccountId:Field<string>
        format:Field<string>
        schema:Field<string>
    }={
        tagFilters:[]
    } as any
    constructor(){
        super(1)
    }
    /**
     * **required:true**
     * @param id The ID that identifies the analytics configuration.
     * 
     * **maps:**`Id`
     */
    Id(id:Field<string>){
        this._.id=id
        return this
    }
    /**
     * **required:false**
     * @param prefix The prefix that an object must have to be included in the analytics results.
     * 
     * **maps:**`Prefix`
     */
    prefix(prefix:Field<string>){
        this._.prefix=prefix
        return this
    }
        /**
     * An arbitrary set of tags (key–value pairs) to filter by.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
     * @param tags a map of tags
     */
    tagFilters(tags: SMap<Field<string>>): this;
    /**
     * @param key the tag key
     * @param value the tag value
     */
    tagFilters(key: Field<string>, value: Field<string>): this;
    tagFilters(tk: Field<string> | SMap<Field<string>>, value?: Field<string>): this {
        if (value != undefined) {
            this._.tagFilters.push({
                Key: tk as Field<string>,
                Value: value
            });
        } else {
            for (const k in tk as SMap<Field<string>>) {
                this._.tagFilters.push({
                    Key: k,
                    Value: tk[k]
                });
            }
        }
        return this;
    }
    /**
     * **required:true**
     * @param bucket The Amazon Resource Name (ARN) of the bucket to which data is exported.
     * 
     * **maps:**`StorageClassAnalysis.DataExport.Destination.BucketArn`
     * @param prefix The prefix to use when exporting data. The prefix is prepended to all results.
     * 
     * **maps:**`StorageClassAnalysis.DataExport.Destination.Prefix`
     * @param accountId The account ID that owns the destination bucket. If no account ID is provided, the owner will not be validated prior to exporting data.
     * 
     * **maps:**`StorageClassAnalysis.DataExport.Destination.BucketAccountId`
     */
    Destination(bucket:Attr<Bucket>,prefix?:Field<string>,accountId?:Field<string>){
        this._.bucket=Attr.get(bucket,"Arn")
        if(prefix) this._.outPath=prefix
        if(accountId) this._.outAccountId=accountId
        return this
    }
    /**
     * **required:false**
     * @param format Specifies the file format used when exporting data to Amazon S3.
     * 
     * **default**:`CSV`
     * 
     * **maps:**`StorageClassAnalysis.DataExport.Destination.Format`
     */
    outputFormat(format:Field<ExportFormat>){
        this._.format=format
        return this
    }
    /**
     * **required:true**
     * @param version The version of the output schema to use when exporting data. Must be V_1.
     * 
     * **maps:**`StorageClassAnalysis.DataExport.OutputSchemaVersion`
     */
    SchemaVersion(version:Field<SchemaVersion>){
        this._.schema=version
        return this
    }
    toJSON():AnalyticsConfigOut {
        return {
            Id:this._.id,
            Prefix:this._.prefix,
            StorageClassAnalysis:{ DataExport:{
                Destination:{
                    BucketAccountId:this._.outAccountId,
                    BucketArn:this._.bucket,
                    Format:this._.format ?? "CSV",
                    Prefix:this._.outPath
                },
                OutputSchemaVersion:this._.schema
            } },
            TagFilters:notEmpty(this._.tagFilters)
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.id){
            errors.push("you must specify an id")
        }
        if(!this._.schema){
            errors.push("you must specify a schema version")
        }
        if(!this._.bucket){
            errors.push("you must specify a bucket")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }
}