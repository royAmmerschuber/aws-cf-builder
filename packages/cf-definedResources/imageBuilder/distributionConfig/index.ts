import { Field } from "aws-cf-builder-core/field";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, generateObject, prepareQueue, resourceIdentifier, stacktrace } from "aws-cf-builder-core/symbols";
import { callOnCheckValid, callOnPrepareQueue, prepareQueueBase } from "aws-cf-builder-core/util";
import { AwsRegion } from "../../util";
import { AmiDistribution as _AmiDistribution, AmiDistributionOut } from "./amiDistConfig";
/**
 * A distribution configuration allows you to specify the name and description of your
 * output AMI, authorize other AWS accounts to launch the AMI, and replicate the AMI to
 * other AWS Regions\. It also allows you to export the AMI to Amazon S3\.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-imagebuilder-distributionconfiguration-distribution.html)
 */
export class DistributionConfig extends Resource{
    readonly [resourceIdentifier]="AWS::ImageBuilder::DistributionConfiguration";
    private _: {
        description: Field<string>
        name:Field<string>
        distributions: Map<Field<string>,{
            amiDist:Field<AmiDistributionOut>,
            licenseArns:Field<string>[]
        }>
        tags: SMap<Field<string>>
    }={
        distributions: new Map(),
        tags: {}
    } as any
    /** the Amazon Resource Name (ARN) of the resource, such as `arn:aws:imagebuilder:us-west-2:123456789012:distribution-configuration/myexampledistribution` */
    r:ReferenceField
    a={
        /** the Amazon Resource Name (ARN) of the resource, such as `arn:aws:imagebuilder:us-west-2:123456789012:distribution-configuration/myexampledistribution` */
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
    /**
     * **required:true**
     * @param name The name of this distribution configuration\.  
     * 
     * **maps:**`Name`
     */
    Name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:false**
     * @param text The description of this distribution configuration\.
     * 
     * **maps:**`Description`
     */
    description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * **required:true**
     * @param map The distributions of this distribution configuration formatted as map of regions to licenses and AmiDistribution\.  
     * 
     * **maps:**`Distributions`
     */
    Distributions(map:Partial<Record<AwsRegion,{
        dist?:DistributionConfig.AmiDistribution|Field<AmiDistributionOut>
        licenses?:Field<string>[]
    }>>):this
    /**
     * **required:true**
     * @param region The target Region for the Distribution Configuration. For example, eu-west-1.
     * 
     * **maps:**`Distributions[].Region`
     * @param amiDistributionConfig The specific AMI settings, such as launch permissions and AMI
     * tags. For details, see example schema below.
     * 
     * **maps:**`Distributions[].AmiDistributionConfiguration`
     * @param licenseConfigArns The License Manager Configuration to associate with the AMI in
     * the specified Region. For more information, see the LicenseConfiguration API.
     * 
     * **maps:**`Distributions[].LicenseConfigurationArns`
     */
    Distributions(region:Field<AwsRegion>,amiDistributionConfig?:DistributionConfig.AmiDistribution|Field<AmiDistributionOut>,licenseConfigArns?:Field<string>[]):this
    Distributions(
        rm:Field<AwsRegion> | SMap<{ dist?:DistributionConfig.AmiDistribution|Field<AmiDistributionOut>, licenses?:Field<string>[] }>,
        amiDist?:DistributionConfig.AmiDistribution|Field<AmiDistributionOut>,
        licenseConfigArns?:Field<string>[]
    ){
        if(amiDist || licenseConfigArns){
            this._.distributions.set(rm as any,{ 
                amiDist,
                licenseArns:licenseConfigArns 
            })
        }else if(typeof rm=="object") {
            for(const k in rm){
                const v=rm[k]
                this._.distributions.set(k,{
                    amiDist:v.dist,
                    licenseArns:v.licenses
                })
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
        if(!this._.distributions.size){
            errors.push("you must specify at least one Distribution")
        }
        if(!this._.name){
            errors.push("you must specify a name")
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
                Name:this._.name,
                Description: this._.description,
                Distributions:this._.distributions.size 
                    ? [...this._.distributions.entries()].map(([k,v])=>({
                        Region:k,
                        AmiDistributionConfiguration:v.amiDist,
                        LicenseConfigurationArns:v.licenseArns,
                    }))
                    : undefined,
                Tags: this._.tags
            }
        }        

    }
}
export namespace DistributionConfig{
    export const AmiDistribution=_AmiDistribution
    export type AmiDistribution=_AmiDistribution
}