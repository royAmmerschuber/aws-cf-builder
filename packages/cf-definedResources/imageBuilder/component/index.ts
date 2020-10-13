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
/**
 * Components are orchestration documents that define a sequence of steps for downloading, 
 * installing, and configuring software packages or for defining tests to run on software 
 * packages. They also define validation and security hardening steps. A component is 
 * defined using a YAML document format. For more information, see Using Documents in EC2 
 * Image Builder.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-imagebuilder-component.html)
 */
export class Component extends Resource{
    readonly [resourceIdentifier]="AWS::ImageBuilder::Component";
    private _: {
        name:Field<string>
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
    /**
     * **required:true**
     * @param name The name of the component.
     * 
     * **maps:**`Name`
     */
    Name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:true**
     * @param version The component version. For example, 1.0.0.
     * 
     * **maps:**`Version`
     */
    Version(version:Field<string>){
        this._.version=version
        return this
    }
    /**
     * **required:false**
     * @param text The description of the component.
     * 
     * **maps:**`Description`
     */
    description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * **required:false**
     * @param text A change description of the component\. For example `initial version`\.  
     * 
     * **maps:**`ChangeDescription`
     */
    changeDescription(text:Field<string>){
        this._.changeDescription=text
        return this
    }
    /**
     * **required:false**
     * @param id The KMS key identifier used to encrypt the component\.  
     * 
     * **maps:**`KmsKeyId`
     */
    kmsKey(id:Attr<"KeyId">){//TODO KMS
        this._.kmsKey=Attr.get(id,"KeyId")
        return this
    }
    /**
     * **required:true**
     * @param type The platform of the component\. For example, `Windows`\.  
     * 
     * **maps:**`Platform`
     */
    Platform(type:Field<Platform>){
        this._.platform=type
        return this
    }
    /**
     * **required:false**
     * 
     * **maps:**`Data`
     * @param phase Phases are a logical grouping of steps.
     * - Each phase name must be unique within a document.
     * - You can define many phases in a document.
     * - Image Builder runs phases called build, validate, and test in the image build pipeline.
     * @param steps Steps are individual units of work that comprise the workflow for each phase.
     * - Each step must define the action to take.
     * - Each step must have a unique name per phase.
     * - Steps are run sequentially.
     * - Both the input and output of a step can be used as inputs for a subsequent step. This 
     *   is called “chaining”.
     * - Each step uses an action module that returns an exit code.
     */
    phase(phase:Field<PhaseName>,steps:(Field<StepOut>|Component.Step)[]){
        this.phases.set(phase,steps)
        return this
    }
    /**
     * **required:false**
     * @param text The data of the component\. For example, 
     * `name: HelloWorldTestingDocument\ndescription: This is hello world testing document.\nschemaVersion: 1.0\n\nphases:\n - name: test\n steps:\n - name: HelloWorldStep\n action: ExecuteBash\n inputs:\n commands:\n - echo \"Hello World! Test.\"\n`\.
     * See Examples below for the schema for creating a component using Data\.   
     * 
     * **maps:**`Data`
     */
    data(text:Field<string>){
        this._.data=text
        return this
    }
    /**
     * **required:false**
     * @param uri The URI of the component document\.  
     * 
     * **maps:**`Uri`
     */
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
    /**
     * **required:false**
     * @param versions The operating system \(OS\) version supported by the component\. If the 
     * OS information is available, a prefix match is performed against the parent image OS 
     * version during image recipe creation\.
     * 
     * **maps:**`SupportedOsVersions`
     */
    supportedOsVersions(...versions:Field<string>[]){
        this._.osVersions.push(...versions)
        return this
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Name:this._.name,
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
        if(!this._.name){
            errors.push("you must specify a Name")
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