import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, prepareQueue, resourceIdentifier, toJson } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty } from "aws-cf-builder-core/util";

export interface AmiDistributionOut{
    amiTags?:SMap<Field<string>>
    name?:Field<string>
    description?:Field<string>
    kmsKeyId?:Field<string>
    launchPermission?:{
        userGroups:Field<string>[]
        userIds:Field<string>[]
    }
    targetAccountIds?:Field<string>[]
}
export class AmiDistribution extends InlineAdvField<AmiDistributionOut>{
    [resourceIdentifier]="AmiDistribution"
    private _:{
        tags:SMap<Field<string>>
        name:Field<string>
        description:Field<string>
        kmsKey:Field<string>
        targetAccounts:Field<string>[]
        accountPermissions:Field<string>[]
        groupPermissions:Field<string>[]
    }={
        tags:{},
        targetAccounts:[],
        accountPermissions:[],
        groupPermissions:[]
    } as any
    constructor(){
        super(1)
    }
    /**
     * **required:false**
     * @param name The name of the distribution configuration.
     * 
     * **maps:**`name`
     */
    name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:false**
     * @param text The description of the distribution configuration.
     * 
     * **maps:**`description`
     */
    description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * **required:false**
     * @param id The KMS key identifier used to encrypt the distributed image.
     * 
     * **maps:**`kmsKeyId`
     */
    kmsKey(id:Attr<"KeyId">){ //TODO KMS Key
        this._.kmsKey=Attr.get(id,"KeyId")
        return this
    }
    /**
     * **required:false**
     * @param ids The ID of an account to which you want to distribute an image.
     * 
     * **maps:**`targetAccountIds`
     */
    targetAccounts(...ids:Field<string>[]){
        this._.targetAccounts.push(...ids)
        return this
    }
    /**
     * **required:false**
     * @param ids The AWS account IDs which can launch this
     * 
     * **maps:**`launchPermission.userIds`
     */
    accountPermissions(...ids:Field<string>[]){
        this._.accountPermissions.push(...ids)
        return this
    }
    /**
     * **required:false**
     * @param names The name of the groups wich can launch this
     * 
     * **maps:**`launchPermission.userGroups`
     */
    groupPermissions(...names:Field<string>[]){
        this._.groupPermissions.push(...names)
        return this
    }
    /**
     * An arbitrary set of tags (key–value pairs) for this Lambda function.
     * 
     * **required:false**
     * 
     * **maps:** `amiTags`
     * @param tags a map of tags
     */
    tag(tags:SMap<Field<string>>):this;
    /**
     * @param key the key of a new tag
     * @param value the value for the tag
     */
    tag(key:string,value:Field<string>):this;
    tag(tk:string|SMap<Field<string>>,value?:Field<string>):this{
        if(typeof tk=="string"){
            this._.tags[tk]=value
        }else{
            this._.tags={
                ...this._.tags,
                ...tk
            }
        }
        return this
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOnCheckValid(this._,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)     
    }
    [toJson]():AmiDistributionOut {
        return {
            name:this._.name,
            description:this._.description,
            kmsKeyId:this._.kmsKey,
            launchPermission:this._.groupPermissions.length || this._.accountPermissions.length 
                ? {
                    userGroups:notEmpty(this._.groupPermissions),
                    userIds:notEmpty(this._.accountPermissions)
                }
                : undefined,
            targetAccountIds:notEmpty(this._.targetAccounts),
            amiTags:notEmpty(this._.tags),
        }
    }

}