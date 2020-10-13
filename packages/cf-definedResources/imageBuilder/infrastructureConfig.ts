import { Field } from "aws-cf-builder-core/field";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, generateObject, prepareQueue, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty, prepareQueueBase, Ref } from "aws-cf-builder-core/util";
import { Role } from "../iam";
import { InstanceProfile } from "../iam/instanceProfile";
import { InstanceType } from "../ec2/instanceTypes"
import { s3PathConverter } from "../util";
import { SecurityGroup } from "../ec2";

export class InfrastructureConfig extends Resource{
    readonly [resourceIdentifier]="AWS::ImageBuilder::InfrastructureConfiguration";
    private _:{
        name:Field<string>
        description:Field<string>
        instanceProfile:Field<string>
        instanceTypes:Field<string>[]
        keyPair:Field<string>
        logging:{
            bucket:Field<string>
            prefix:Field<string>
        }
        securityGroups:Field<string>[]
        subnet:Field<string>
        snsTopic:Field<string>
        terminateOnFailure:Field<boolean>

        resourceTags:SMap<Field<string>>
        tags:SMap<Field<string>>
    }={
        securityGroups:[],
        instanceTypes:[],
        resourceTags:{},
        tags:{}
    } as any

    /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:infrastructure-configuration/my-example-infrastructure` */
    r:ReferenceField
    a={
        /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:infrastructure-configuration/my-example-infrastructure` */
        Arn:new AttributeField(this,"Arn")
    }
    constructor(){
        super(1)
    }
    Name(name:Field<string>){
        this._.name=name
        return this
    }
    InstanceProfile(role:Attr<Role>):this
    InstanceProfile(instanceProfile:Ref<InstanceProfile>):this
    InstanceProfile(ri:Attr<Role|InstanceProfile>):this{
        if(ri instanceof Resource){
            //@ts-ignore
            this._.instanceProfile=ri.a.instanceProfileName ?? ri.r
        }else{
            this._.instanceProfile=ri
        }
        return this
    }
    instanceTypes(...types:Field<InstanceType>[]):this
    instanceTypes(...types:Field<InstanceType|string>[]):this
    instanceTypes(...types:Field<InstanceType|string>[]){
        this._.instanceTypes.push(...types)
        return this
    }
    keyPair(name:Field<string>){
        this._.keyPair=name
        return this
    }
    s3Log(s3Location:string):this
    s3Log(bucket:Field<string>,prefix?:Field<string>):this
    s3Log(bp:Field<string>,prefix?:Field<string>){
        if(!prefix && typeof bp=="string" && bp.startsWith("s3://")){
            const { bucket,key,version}=s3PathConverter(bp)
            if(version) throw new PreparableError(this,"version in s3 path not accepted")
            this._.logging={
                bucket,
                prefix:key
            }
        }else{
            this._.logging={
                bucket: bp,
                prefix
            }
        }
        return this
    }
    securityGroups(...groups:Attr<SecurityGroup>[]){
        this._.securityGroups.push(...groups.map(v=>Attr.get(v,"GroupId")))
        return this
    }
    subnet(id:Attr<"VpcId">){ //TODO AWS::EC2::Subnet
        this._.subnet=Attr.get(id,"VpcId")
        return this
    }
    snsTopic(arn:Attr<"Arn">){ //TODO AWS::SNS::Topic
        this._.snsTopic=Attr.get(arn,"Arn")
        return this
    }
    terminateOnFailure(bool=true){
        this._.terminateOnFailure=bool
        return this
    }
    resourceTag(tags:SMap<Field<string>>):this;
    resourceTag(key:string,value:Field<string>):this;
    resourceTag(tk:string|SMap<Field<string>>,value?:Field<string>):this{
        if(typeof tk=="string"){
            this._.resourceTags[tk]=value
        }else{
            this._.resourceTags={
                ...this._.resourceTags,
                ...tk
            }
        }
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
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache];
        const errors:string[]=[]
        if(!this._.name){
            errors.push("you must specify a name")
        }
        if(!this._.instanceProfile){
            errors.push("you must specify a instanceProfile")
        }
        const out:SMap<ResourceError>={}
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true)
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Name: this._.name,
                Description: this._.description,
                InstanceProfileName: this._.instanceProfile,
                InstanceTypes: notEmpty(this._.instanceTypes) ,
                KeyPair: this._.keyPair,
                Logging: this._.logging
                    ? {
                        S3Logs:{
                            S3BucketName: this._.logging.bucket,
                            S3KeyPrefix: this._.logging.prefix
                        }
                    }
                    : undefined,
                SecurityGroupIds:notEmpty(this._.securityGroups),
                SnsTopicArn: this._.snsTopic,
                SubnetId: this._.subnet,
                ResourceTags: notEmpty(this._.resourceTags),
                Tags: notEmpty(this._.tags),
                TerminateInstanceOnFailure: this._.terminateOnFailure
            }
        }
    }
}