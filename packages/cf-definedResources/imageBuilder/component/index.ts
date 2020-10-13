import { AdvField, Field } from "aws-cf-builder-core/field";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { JSONField } from "aws-cf-builder-core/fields/jsonField";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { PathDataCarrier, pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, generateObject, prepareQueue, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty, prepareQueueBase } from "aws-cf-builder-core/util";
import _ from "lodash/fp";
import { Step as _Step, StepOut } from "./step";
export type Platform= "Linux" | "Windows"
export type PhaseName= "build"|"test"|"validate"
export class Component extends Resource{
    readonly [resourceIdentifier]="AWS::ImageBuilder::Component";
    private _: {
        version: Field<string>
        description: Field<string>
        changeDescription: Field<string>
        kmsKey: Field<string>
        platform: string | AdvField<Platform>
        tags: SMap<Field<string>>
        data:Field<string>
        uri:Field<string>
        osVersions:Field<string>[]
    }={
        tags:{},
        osVersions:[]
    } as any
    private phases=new Map<Field<string>,Field<StepOut>[]>()
    /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:component/examplecomponent/2019.12.02/1` */
    r:ReferenceField
    a={
        /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:component/examplecomponent/2019.12.02/1` */
        Arn:new AttributeField(this,"Arn"),
        /** Returns the encryption status of the component. For example `true` or `false`. */
        Encrypted:new AttributeField(this,"Encrypted"),
        /** Not currently supported by AWS CloudFormation. @deprecated */
        Name:new AttributeField(this,"Name"),
        /** Returns the component type. For example, `BUILD` or `TEST`. */
        Type:new AttributeField(this,"Type"),
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
    changeDescription(text:Field<string>){
        this._.changeDescription=text
        return this
    }
    kmsKey(id:Attr<"KeyId">){//TODO KMS
        this._.kmsKey=Attr.get(id,"KeyId")
        return this
    }
    Platform(type:Field<Platform>){
        this._.platform=type
        return this
    }
    phase(phase:Field<PhaseName>,steps:(Field<StepOut>|Component.Step)[]){
        this.phases.set(phase,steps)
        return this
    }
    /**overrides phase data */
    data(text:Field<string>){
        this._.data=text
        return this
    }
    uri(uri:Field<string>){
        this._.uri=uri
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
    supportedOsVersions(...versions:Field<string>[]){
        this._.osVersions.push(...versions)
        return this
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Version: this._.version,
                ChangeDescription:this._.changeDescription,
                Description:this._.description,
                KmsKeyId:this._.kmsKey,
                Platform:this._.platform,
                SupportedOsVersions: notEmpty(this._.osVersions),
                Tags: notEmpty(this._.tags),
                Data:this._.data 
                    ? this._.data
                    : this.phases.size
                        ? new JSONField({
                            schemaVersion:"1.0",
                            phases:[...this.phases.entries()]
                                .map(([phase,steps])=>({
                                    name:phase,
                                    steps
                                }))
                        })
                        : undefined,
                Uri: this._.uri
            }
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache];
        //@ts-ignore
        const dataSourceCount=!!this._.data+!!this._.uri+!!this.phases.size
        const errors:string[]=[]
        if(dataSourceCount>1){
            errors.push("you must specify only one of data, uri or phases")
        }else if(dataSourceCount < 1){
            errors.push("you must specify one of data, uri or phases")
        }
        if(!this._.version){
            errors.push("you must specify a Version")
        }
        if(!this._.version){
            errors.push("you must specify a Platform")
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
            this.phases
        ],out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true)
            this.phases
                .forEach(v=>v
                    .forEach(( v,i )=>callOnPrepareQueue(v,stack,new PathDataCarrier(this,{
                        index:i
                    }),true)))
        }
    }
}
export namespace Component{
    export type Step=_Step
    export const Step=_Step
}