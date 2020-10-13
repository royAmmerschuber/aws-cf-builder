import { Field } from "aws-cf-builder-core/field";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { NamedPath, pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, generateObject, prepareQueue, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty, prepareQueueBase } from "aws-cf-builder-core/util";
import { Image } from "../image";
import { Component } from "../component";
import { BlockDeviceMapping as _BlockDeviceMapping, BlockDeviceMappingOut } from "./blockDeviceMapping";

export class Recipe extends Resource{
    readonly [resourceIdentifier]="AWS::ImageBuilder::ImageRecipe";
    private _:{
        version:Field<string>
        description:Field<string>
        parentImage:Field<string>
        workingDir:Field<string>
        blockMappings:Field<BlockDeviceMappingOut>[]
        tags:SMap<Field<string>>
    }={
        tags:{},
        blockMappings:[]
    } as any
    private components:Field<string>[]=[]
    /** the resource ARN, such as `arn:aws:imagebuilder:us-east-1:123456789012:image-recipe/mybasicrecipe/2019.12.03`. */
    r:ReferenceField
    a={
        /** the resource ARN, such as `arn:aws:imagebuilder:us-east-1:123456789012:image-recipe/mybasicrecipe/2019.12.03`. */
        Arn:new AttributeField(this,"Arn"),
        /**
         * Not currently supported by AWS CloudFormation.
         * @deprecated 
         */
        Name:new AttributeField(this,"Name")
    }
    constructor(){
        super(1)
    }
    Version(version:Field<string>){
        this._.version=version
        return this
    }
    description(text:Field<string>){
        this._.description=text
        return this
    }
    ParentImage(arnOrId:Attr<Image>){
        this._.parentImage=Attr.get(arnOrId,"Arn")
        return this
    }
    workingDirectory(dir:Field<string>){
        this._.workingDir=dir
        return this
    }
    Components(...arns:Attr<Component>[]){
        this.components.push(...arns.map(v=>Attr.get(v,"Arn")))
        return this
    }
    blockDevicceMapping(...mappings:(Recipe.BlockDeviceMapping|Field<BlockDeviceMappingOut>)[]){
        this._.blockMappings.push(...mappings)
        return this
    }
    /**
     * An arbitrary set of tags (key–value pairs) for this Lambda function.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
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
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                BlockDeviceMappings:notEmpty(this._.blockMappings),
                Components: notEmpty(this.components.map(v=>({
                    ComponentArn:v
                }))),
                Description: this._.description,
                ParentImage: this._.parentImage,
                Tags: notEmpty(this._.tags),
                Version: this._.version,
                WorkingDirectory: this._.workingDir
            }
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache];
        const errors:string[]=[]
        if(!this._.version){
            errors.push("you must specify a version")
        }
        if(!this._.parentImage){
            errors.push("you must specify a parentImage")
        }
        if(!this.components.length){
            errors.push("you must specify at least one component")
        }
        const out:SMap<ResourceError>={}
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid([
            this._,
            this.components
        ],out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true),
            this.components
                .forEach((v,i)=>callOnPrepareQueue(v,stack,new NamedPath(this,String(i)),true))
        }
    }
}
export namespace Recipe{
    export const BlockDeviceMapping=_BlockDeviceMapping
    export type BlockDeviceMapping=_BlockDeviceMapping
}