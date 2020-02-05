import _ from "lodash/fp"
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { generateObject, checkValid, prepareQueue, resourceIdentifier, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { Field } from "aws-cf-builder-core/field";
import { Tag } from "../../util";
import { JSONField } from "aws-cf-builder-core/fields/jsonField"
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { callOn, prepareQueueBase } from "aws-cf-builder-core/util";
import { Policy as Policies,PolicyOut } from "./policy";
import * as Aws from "../../aws"
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { Sub } from "aws-cf-builder-core/fields/substitution";

export class Parameter extends Resource{
    [resourceIdentifier]="AWS::SSM::Parameter"
    private _:{
        allowedPattern:Field<string>
        description:Field<string>
        name:Field<string>
        policies:Field<string>
        tags:Tag[]
        tier:Field<string>
        type:Field<string>
        value:Field<string>
    }={
        tags:[]
    } as any
    /**
     * the Name of the SSM parameter. For example, `ssm-myparameter-ABCNPH3XCAO6`.
     */
    r:ReferenceField
    a={
        /**
         * the type of the parameter. Valid values are String or StringList.
         */
        Type:new AttributeField(this,"Type"),
        /**
         * the value of the parameter.
         */
        Value:new AttributeField(this,"Value"),
        /**
         * the Arn of the resource
         */
        Arn:Sub`arn:${Aws.partition}:ssm:${Aws.region}:${Aws.accountId}:parameter/${this.r}`
    }

    constructor(){
        super(1)
    }
    /**
     * **required:false**
     * 
     * @param pattern A regular expression used to validate the parameter value. 
     * For example, for String types with values restricted to numbers, you can 
     * specify the following: AllowedPattern=^\d+$
     * 
     * **maps:**`AllowedPattern`
     */
    allowedPattern(pattern:Field<string>|RegExp){
        if(pattern instanceof RegExp){
            this._.allowedPattern=pattern.source
        }else{
            this._.allowedPattern=pattern
        }
        return this
    }

    /**
     * **required:false**
     * @param text Information about the parameter.
     * **maps:**`Description`
     */
    description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * **required:false**
     * @param name The name of the parameter.
     * 
     * **maps:**`Name`
     */
    name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * 
     * @param json Information about the policies assigned to a parameter.
     * [Working with Parameter Policies](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-policies.html) 
     * in the AWS Systems Manager User Guide.
     */
    policies(json:Field<string>):this;
    policies(policies:(Field<PolicyOut>|Parameter.Policy)[]):this
    policies(policies:Field<string>|(Field<PolicyOut>|Parameter.Policy)[]){
        if(policies instanceof Array){
            this._.policies=new JSONField(policies)
        }else{
            this._.policies=policies
        }
        this._.policies
        return this
    }
    /**
     * Optional metadata that you assign to a resource in the form of an arbitrary set of
     * tags (key-value pairs). Tags enable you to categorize a resource in different ways,
     * such as by purpose, owner, or environment. For example, you might want to tag a
     * Systems Manager parameter to identify the type of resource to which it applies, the
     * environment, or the type of configuration data referenced by the parameter.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
     * @param tags a map of tags
     */
    tag(tags:SMap<Field<string>>):this;
    /**
     * Optional metadata that you assign to a resource in the form of an arbitrary set of
     * tags (key-value pairs). Tags enable you to categorize a resource in different ways,
     * such as by purpose, owner, or environment. For example, you might want to tag a
     * Systems Manager parameter to identify the type of resource to which it applies, the
     * environment, or the type of configuration data referenced by the parameter.
     * 
     * @param key the key of a new tag
     * @param value the value for the tag
     */
    tag(key:Field<string>,value:Field<string>):this;
    tag(tk:Field<string>|SMap<Field<string>>,value?:Field<string>):this{
        if(value!=undefined){
            this._.tags.push({
                Key:tk as Field<string>,
                Value:value
            });
        }else{
            for(const k in tk as SMap<Field<string>>){
                this._.tags.push({
                    Key:k,
                    Value:tk[k]
                });
            }
        }
        return this;
    }
    /**
     * **required:false**
     * @param tier The parameter tier.
     * 
     * **maps:**`Tier`
     */
    tier(tier:Field<"Advanced" | "Intelligent-Tiering" | "Standard">){
        this._.tier=tier
        return this
    }
    /**
     * **required:true**
     * @param type The type of parameter.
     * 
     * > **Note**
     * >
     * > AWS CloudFormation doesn't support creating a SecureString parameter type.
     * 
     * **maps:**`Type`
     */
    Type(type:Field<"String"|"StringList">){
        this._.type=type
        return this
    }
    /**
     * **required:true**
     * @param value The parameter value.
     * 
     * **maps:**`Value`
     */
    Value(value:Field<string>){
        this._.value=value
        return this
    }
    [checkValid]() {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.type){
            errors.push("you must specify a Type")
        }
        if(!this._.value){
            errors.push("you must specify a Value")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            };
        }
        return this[checkCache]=callOn(this._,Preparable,o=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack: stackPreparable, path:pathItem, ref: boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable,o=>o[prepareQueue](stack,this,true))
        }
    }

    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Name:this._.name,
                Type:this._.type,
                Value:this._.value,
                Description:this._.description,
                AllowedPattern:this._.allowedPattern,
                Policies:this._.policies
            }
        }
    }

}
export namespace Parameter{
    export const Policy=Policies
    export type Policy=
        Policies.Expiration|
        Policies.ExpirationNotification|
        Policies.NoChangeNotification
}