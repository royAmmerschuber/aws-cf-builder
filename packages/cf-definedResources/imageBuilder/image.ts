import { Field } from "aws-cf-builder-core/field";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, generateObject, prepareQueue, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty, prepareQueueBase } from "aws-cf-builder-core/util";
import { DistributionConfig } from "./distributionConfig";
import { InfrastructureConfig } from "./infrastructureConfig";
import { Recipe } from "./recipe";
/**
 * An image build version. An image is a customized, secure, and up-to-date “golden” 
 * server image that is pre-installed and pre-configured with software and settings 
 * to meet specific IT standards.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-imagebuilder-image.html)
 */
export class Image extends Resource{
    [resourceIdentifier]="AWS::ImageBuilder::Image";
    private _:{
        enhancedMetadata:Field<boolean>
        recipe:Field<string>
        distributionConfig:Field<string>
        infrastructureConfig:Field<string>
        testConfig:{
            enabled:Field<boolean>,
            timeoutMin:Field<number>
        },
        tags:SMap<Field<string>>
    }={
        tags:{}
    } as any
    /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:image/my-example-image`. */
    r:ReferenceField
    a={
        /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:image/my-example-image`. */
        Arn:new AttributeField(this,"Arn"),
        /** the AMI ID of the EC2 AMI in the Region in which you are using Image Builder. */
        ImageId:new AttributeField(this,"ImageId")
    }
    constructor()
    constructor(depth=0){
        super(1)
    }
    /**
     * **required:false**
     * @param enabled Collects additional information about the image being created, including the 
     * operating system (OS) version and package list. This information is used to enhance the 
     * overall experience of using EC2 Image Builder. Enabled by default.
     * 
     * **maps:**`EnhancedImageMetadataEnabled`
     */
    enhandedMetadata(enabled:boolean=true){
        this._.enhancedMetadata=enabled
        return this
    }
    /**
     * **required:true**
     * @param arn The Amazon Resource Name (ARN) of the image recipe.
     * 
     * **maps:**`ImageRecipeArn`
     */
    Recipe(arn:Attr<Recipe>){
        this._.recipe=Attr.get(arn,"Arn")
        return this
    }
    /**
     * **required:false**
     * @param arn The Amazon Resource Name (ARN) of the distribution configuration.
     * 
     * **maps:**`DistributionConfigurationArn`
     */
    distributionConfig(arn:Attr<DistributionConfig>){
        this._.distributionConfig=Attr.get(arn,"Arn")
        return this
    }
    /**
     * **required:true**
     * @param arn The Amazon Resource Name (ARN) of the infrastructure configuration used to create 
     * this image.
     * 
     * **maps:**`InfrastructureConfigurationArn`
     */
    InfrastructureConfig(arn:Attr<InfrastructureConfig>){
        this._.infrastructureConfig=Attr.get(arn,"Arn")
        return this
    }
    /**
     * The configuration of the image tests used when creating this image.
     * 
     * **required:false**
     * @param enabled Defines if tests should be executed when building this image.
     * 
     * **maps:**`ImageTestsConfiguration.ImageTestsEnabled`
     * @param timeoutMin The maximum time in minutes that tests are permitted to run.
     * 
     * **maps:**`ImageTestsConfiguration.TimeoutMinutes`
     */
    testConfig(enabled:Field<boolean>,timeoutMin?:Field<number>){
        this._.testConfig={enabled,timeoutMin}
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
        if(this._.testConfig?.timeoutMin > 1440 || 60 > this._.testConfig?.timeoutMin ){
            errors.push("the testConfig timeout must be between 60 and 1440 Minutes")
        }
        if(!this._.recipe){
            errors.push("you must specify a recipe")
        }
        if(!this._.infrastructureConfig){
            errors.push("you must specify an infrastructureConfig")
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
            Type: this[resourceIdentifier],
            Properties: {
                ImageRecipeArn: this._.recipe,
                InfrastructureConfigurationArn: this._.infrastructureConfig,
                DistributionConfigurationArn: this._.distributionConfig,
                EnhancedImageMetadataEnabled:this._.enhancedMetadata,
                ImageTestsConfiguration: this._.testConfig 
                    ? {
                        ImageTestsEnabled: this._.testConfig.enabled,
                        TimeoutMinutes: this._.testConfig.timeoutMin
                    } 
                    : undefined,
                Tags: notEmpty(this._.tags)
            }
        }
    }
}