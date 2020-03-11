import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty } from "aws-cf-builder-core/util";
import { ExportFormat } from "./analyticsConfig";
import { Bucket } from "."

export interface InvenetoryConfigOut{
    Destination: {
        BucketArn: Field<string>
        Format: Field<string>
        BucketAccountId?: Field<string>
        Prefix?: Field<string>
    }
    Enabled: Field<boolean>
    Id: Field<string>
    IncludedObjectVersions: Field<string>
    ScheduleFrequency: Field<string>
    OptionalFields?: Field<string>[]
    Prefix?: Field<string>
}

export class InventoryConfig extends InlineAdvField<InvenetoryConfigOut>{
    [resourceIdentifier]="InventoryConfig"
    private _:{
        bucket:Field<string>
        outPath:Field<string>
        outAccountId:Field<string>
        format:Field<string>
        enabled:Field<boolean>
        prefix:Field<string>
        id:Field<string>
        includedVersions:Field<string>
        frequency:Field<string>
        optionalFields:Field<string>[]
    }={
        optionalFields:[]
    } as any
    constructor(){
        super(1)
    }
    /**
     * **required:true**
     * @param id The ID used to identify the inventory configuration.
     * 
     * **maps:**`Id`
     */
    Id(id:Field<string>){
        this._.id=id
        return this
    }
    /**
     * **required:false**
     * @param prefix The prefix that is prepended to all inventory results.
     * 
     * **maps:**`Prefix`
     */
    prefix(prefix:Field<string>){
        this._.prefix=prefix
        return this
    }
    /**
     * **required:false**
     * @param fields Contains the optional fields that are included in the inventory results.
     * 
     * **maps:**`OptionalFields`
     */
    optionalFields(...fields:string[]){
        this._.optionalFields.push(...fields)
    }
    /**
     * **required:true**
     * @param bucket The Amazon Resource Name (ARN) of the bucket to which data is exported.
     * 
     * **maps:**`StorageClassAnalysis.DataExport.Destination.BucketArn`
     * @param prefix The prefix to use when exporting data. The prefix is prepended to all results.
     * 
     * **maps:**`StorageClassAnalysis.DataExport.Destination.Prefix`
     * @param accountId The account ID that owns the destination bucket. If no account ID is provided, the owner will not be validated
     * prior to exporting data.
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
     * **required:false**
     * @param bool Specifies whether the inventory is enabled or disabled. If set to True, an inventory list is generated. If set to
     * False, no inventory list is generated.
     * 
     * **default**:`true`
     * 
     * **maps:**`Enabled`
     */
    enabled(bool:Field<boolean>=true){
        this._.enabled=bool
        return this
    }
    /**
     * **required:true**
     * @param versions Object versions to include in the inventory list. If set to All, the list includes all the object versions, which
     * adds the version-related fields VersionId, IsLatest, and DeleteMarker to the list. If set to Current, the list does not contain
     * these version-related fields.
     * 
     * **maps:**`IncludedObjectVersions`
     */
    IncludedVersions(versions:Field<"All"|"Current">){
        this._.includedVersions=versions
        return this
    }
    /**
     * **required:true**
     * @param frequency Specifies the schedule for generating inventory results. Valid Values: Daily | Weekly.
     * 
     * **maps:**`ScheduleFrequency`
     */
    frequency(frequency:Field<"Daily"|"Weekly">){
        this._.frequency=frequency
    }
    toJSON():InvenetoryConfigOut {
        return {
            Destination:{
                BucketArn:this._.bucket,
                Format:this._.format ?? "CSV",
                BucketAccountId:this._.outAccountId,
                Prefix:this._.outPath
            },
            Id:this._.id,
            Enabled:this._.enabled ?? true,
            IncludedObjectVersions:this._.includedVersions,
            ScheduleFrequency:this._.frequency,
            OptionalFields:notEmpty(this._.optionalFields),
            Prefix:this._.prefix
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.id){
            errors.push("you must specify an id")
        }
        if(!this._.bucket){
            errors.push("you must specify a bucket")
        }
        if(!this._.frequency){
            errors.push("you must specify a frequency")
        }
        if(!this._.includedVersions){
            errors.push("you must specify the included Versions")
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