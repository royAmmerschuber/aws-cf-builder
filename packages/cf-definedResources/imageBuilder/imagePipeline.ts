
import { Field } from "aws-cf-builder-core/field";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, generateObject, prepareQueue, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue, notEmpty, prepareQueueBase } from "aws-cf-builder-core/util";
import { CronExpression } from "../cloudwatch/rule/cron";
import { DistributionConfig } from "./distributionConfig";
import { InfrastructureConfig } from "./infrastructureConfig";
import { Recipe } from "./recipe";
export type PipelineStartCondition=
    "EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE" |
    "EXPRESSION_MATCH_ONLY"
/**
 * An image pipeline is the automation configuration for building secure OS images on AWS. The 
 * Image Builder image pipeline is associated with an image recipe that defines the build, validation, 
 * and test phases for an image build lifecycle. An image pipeline can be associated with an infrastructure 
 * configuration that defines where your image is built. You can define attributes, such as instance type, 
 * subnets, security groups, logging, and other infrastructure-related configurations. You can also 
 * associate your image pipeline with a distribution configuration to define how you would like to 
 * deploy your image.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-imagebuilder-imagepipeline.html)
 */
export class ImagePipeline extends Resource{
    readonly [resourceIdentifier]="AWS::ImageBuilder::ImagePipeline";
    private _:{
        description:Field<string>
        status:Field<string>
        schedule:{
            startCondition:Field<string>
            cron:Field<string>
        }
        name:Field<string>

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
    /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:image-pipeline/mywindows2016pipeline`. */
    r:ReferenceField
    a={
        /** the resource ARN, such as `arn:aws:imagebuilder:us-west-2:123456789012:image-pipeline/mywindows2016pipeline`. */
        Arn:new AttributeField(this,"Arn"),
        /** Not currently supported by AWS CloudFormation. @deprecated */
        Name:new AttributeField(this,"Name")
    }
    constructor(){
        super(1)
    }
    /**
     * **required:false**
     * @param bool The status of the image pipeline.
     * 
     * **maps:**`Status`
     */
    enabled(bool:boolean|Field<"ENABLED"|"DISABLED">=true){
        if(typeof bool=="boolean"){
            this._.status= bool 
                ? "ENABLED"
                : "DISABLED"
        }else{
            this._.status=bool
        }
        return this
    }
    /**
     * **required:false**
     * @param text The description of this image pipeline.
     * 
     * **maps:**`Description`
     */
    description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * The schedule of the image pipeline. A schedule configures how often and when a pipeline 
     * will automatically create a new image.
     * 
     * **required:false**
     * @param cron The cron expression determines how often EC2 Image Builder evaluates your 
     * pipelineExecutionStartCondition.
     * 
     * For information on how to format a cron expression in Image Builder, see Use cron 
     * expressions in EC2 Image Builder.
     * 
     * **maps:**`Schedule.ScheduleExpression`
     * @param startCondition The condition configures when the pipeline should trigger a new 
     * image build. When the pipelineExecutionStartCondition is set to 
     * EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE, and you use semantic version filters 
     * on the source image or components in your image recipe, EC2 Image Builder will build a new 
     * image only when there are new versions of the image or components in your recipe that match 
     * the semantic version filter. When it is set to EXPRESSION_MATCH_ONLY, it will build a new 
     * image every time the CRON expression matches the current time. For semantic version syntax, 
     * see CreateComponent in the EC2 Image Builder API Reference.
     * 
     * **maps:**`Schedule.PipelineExecutionStartCondition`
     */
    schedule(cron:Field<string>|CronExpression,startCondition?:Field<PipelineStartCondition>){
        this._.schedule={ cron, startCondition }
        return this
    }
    /**
     * **required:true**
     * @param name The name of the image pipeline.
     * 
     * **maps:**`Name`
     */
    Name(name:Field<string>){
        this._.name=name
        return this
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
        if(!this._.name){
            errors.push("you must specify a name")
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
                Name:this._.name,
                Description:this._.description,
                Status:this._.status,
                Schedule:this._.schedule && {
                    ScheduleExpression:this._.schedule.cron,
                    PipelineExecutionStartCondition:this._.schedule.startCondition
                },


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
