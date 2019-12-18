import _ from "lodash/fp";

import { Resource } from "aws-cf-builder-core/generatables/resource";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { Attr, callOn, prepareQueueBase, notEmpty } from "aws-cf-builder-core/util";
import { checkValid, prepareQueue, generateObject, stacktrace, checkCache, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Permission } from "../../lambda/permission";
import { LambdaLayerable } from "../../lambda/layer";
import { Version } from "../../lambda/version"
import { EventMapping } from "../../lambda/eventMapping";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { Role } from "../../iam/role";
import { DeploymentPreferenceOut, DeploymentPreference as DeplPreference } from "./deploymentPreference";
import { runtimes } from "../../lambda/function";
import { EventOut } from "./event";
import { Policy } from "../../iam";
import { PolicyOut } from "../../iam/policy/policyDocument";
import { PolicyTemplateOut } from "../policyTemplate";

export class ServerlessFunction extends Resource{
    readonly [resourceIdentifier]="AWS::Serverless::Function"

    //#region parameters
    private _:{
        codeStorageMethod: "bucket"|"uri"|"inline"
        bucketCode:{bucket:Field<string>,key:Field<string>,version?:Field<string>}
        codeUri:Field<string>
        inlineCode:Field<string>
        autoPublishAlias:Field<string>
        dlq:{
            TargetArn:Field<string>
            Type:Field<string>
        }
        description: Field<string>
        environment:SMap<Field<string>>
        deploymentPreference:Field<DeploymentPreferenceOut>
        events:Field<EventOut>[]
        handler: Field<string>
        name:Field<string>
        kmsArn: Field<string>
        layers:Field<string>[]
        memory: Field<number>
        permissionBoundary:Field<string>
        policies:Field<string|PolicyOut|PolicyTemplateOut>[]
        reservedExecutions: Field<number>
        role: Field<string>
        runtime: Field<runtimes>
        tags:SMap<Field<string>>
        tiemout: Field<number>
        tracingMode: Field<string>
        vpcConfig: { 
            SecurityGroupIds: Field<string>[],
            SubnetIds: Field<string>[];
        }

        versionDescription:Field<string>
    }={
        tags:[],
        handler:"index.handler",
        environment:{},
        layers:[],
        events:[],
        policies:[]
    } as any
    private permissions:Permission[]=[];
    private versions:Version[]=[];
    private eventMappings: EventMapping[]=[]
    //#endregion
    /**
     * the resource name
     */
    r:ReferenceField
    a={
        //TODO access Version & Alias
        /**
         * The Amazon Resource Name (ARN) of the function.
         */
        Arn:new AttributeField(this,"Arn"),
    }
    
    constructor(){super(2)}
    /**
     * **required:false**
     * 
     * **maps:**`FunctionName`
     * @param name A name for the function. 
     * 
     * > **Important**
     * > 
     * > If you set this, you cannot perform updates that 
     * > require replacement of this resource. You can perform updates 
     * > that require no or some interruption. If you must replace the 
     * > resource, specify a new name.
     */
    name(name:Field<string>){
        this._.name=name
        return this
    }
    //#region simple properties
    /**
     * AWS S3 Uri, local file path, or FunctionCode object of the function code.
     * 
     * If an AWS S3 Uri or FunctionCode object is provided, the AWS S3 object 
     * referenced must be a valid Lambda deployment package.
     * 
     * If a local file path is provided, the template must go through the 
     * workflow that includes the sam deploy or sam package command, in order 
     * for the code to be transformed properly.
     * 
     * **Note**: Either CodeUri or InlineCode is required.
     * 
     * **required:Conditional or InlineCode**
     * 
     * **maps:** `Code`
     * @param uri 
     * AWS S3 Uri or local file path
     * If an AWS S3 Uri or FunctionCode object is provided, the AWS S3 object 
     * referenced must be a valid Lambda deployment package.
     * 
     * If a local file path is provided, the template must go through the 
     * workflow that includes the sam deploy or sam package command, in 
     * order for the code to be transformed properly.
     * 
     * **maps:** `CodeUri`
     */
    Code(uri:Field<string>):this;
    /**
     * @param bucket The name of the Amazon S3 bucket where the .zip 
     * file that contains your deployment package is stored. This 
     * bucket must reside in the same AWS Region that you're creating 
     * the Lambda function in. You can specify a bucket from another 
     * AWS account as long as the Lambda function and the bucket are 
     * in the same region.
     * 
     * > **Note**
     * > 
     * > The cfn-response module isn't available for source code that's 
     * > stored in Amazon S3 buckets. To send responses, write your own 
     * > functions.
     * 
     * **maps:** `Code.Bucket`
     * @param key The location and name of the .zip file that contains 
     * your source code. If you specify this property, you must also 
     * specify the S3Bucket property.
     * 
     * **maps:** `Code.Key`
     * @param version If you have S3 versioning enabled, the version 
     * ID of the.zip file that contains your source code. You can 
     * specify this property only if you specify the S3Bucket and S3Key 
     * properties.
     * 
     * **maps:** `Code.Version`
     */
    Code(bucket:Field<string>,key:Field<string>,version?:Field<string>):this;
    Code(bp:Field<string>,key?:Field<string>,version?:Field<string>):this{
        if(key){
            this._.bucketCode={
                bucket:bp,
                key:key,
                version:version
            }
            this._.codeStorageMethod="bucket";
        }else{
            this._.codeUri=bp;
            this._.codeStorageMethod="uri";
        }
        return this;
    }
    /**
     * **required: Conditional or Code**
     * @param code Lambda function code written directly in the template.
     * 
     * **maps:**`InlineCode`
     */
    InlineCode(code:Field<string>){
        this._.inlineCode=code
        this._.codeStorageMethod="inline"
        return this
    }
    /**
     * **required:false**
     * @param name Name of the Lambda alias. For more information about Lambda aliases, see 
     * AWS Lambda Function Aliases.
     * 
     * This AWS SAM property generates two additional resources: an AWS::Lambda::Version 
     * resource and an AWS::Lambda::Alias resource.
     * 
     * The AWS::Lambda::Version resource has a logical id of <function-logical-id>Version<sha>, 
     * where the <sha> is 10 digits of the SHA256 of CodeUri. This resource can be referenced 
     * in intrinsic functions by using the logical ID or <function-logical-id>.Version.
     * 
     * The AWS::Lambda::Alias resource has a logical id of <function-logical-id>Alias<alias-name>, 
     * where <alias-name> is the alias name specified in this property. This resource can be 
     * referenced in intrinsic functions by using the logical ID or <function-logical-id>.Alias.
     * 
     * For examples that use this property, see Deploying Serverless Applications Gradually.
     * 
     * **maps:**`AutoPublishAlias`
     */
    autoPublishAlias(name:Field<string>){
        this._.autoPublishAlias=name
        return this
    }
    /**
     * Key-value pairs that Lambda caches and makes available 
     * for your Lambda functions. Use environment variables to 
     * apply configuration changes, such as test and production 
     * environment configurations, without changing your Lambda 
     * function source code.
     * 
     * **required:false**
     * 
     * **maps:** `Environment`
     * @param key the key of the Variable
     * @param value the value
     */
    environment(key:string,value:Field<string>):this;
    /**
     * @param map a key value Map
     */
    environment(map:SMap<Field<string>>):this;
    environment(km:string|SMap<Field<string>>,value?:Field<string>):this{
        if(value){
            this._.environment[km as string]=value;
        }else{
            for(const k in km as SMap<Field<string>>){
                this._.environment[k]=km[k];
            }
        }
        return this;
    }
    /**
     * **required:false**
     * @param preference Settings to enable gradual Lambda deployments.
     * 
     * If a DeploymentPreference object is specified, SAM will create an 
     * AWS::CodeDeploy::Application called ServerlessDeploymentApplication 
     * (one per stack), an AWS::CodeDeploy::DeploymentGroup called 
     * <function-logical-id>DeploymentGroup, and an AWS::IAM::Role called 
     * CodeDeployServiceRole.
     * 
     * **maps:**`DeploymentPreference`
     */
    deploymentPreference(preference:Field<DeploymentPreferenceOut>|ServerlessFunction.DeploymentPreference){
        this._.deploymentPreference=preference
        return this
    }
    /**
     * **required:false**
     * @param sources Specifies the events that trigger this function. 
     * Events consist of a type and a set of properties that depend on the type.
     * 
     * **maps:**`Events`
     */
    events(...sources:Field<EventOut>[]){
        this._.events.push(...sources)
        return this
    }
    /**
     * **required:false**
     * 
     * **maps:** `Handler`
     * @param name The name of the function (within your source code) 
     * that Lambda calls to start running your code. For more 
     * information, see the Handler property in the AWS Lambda 
     * Developer Guide.
     * 
     * > **Note**
     * > 
     * > If you specify your source code as inline text by specifying 
     * > the ZipFile property within the Code property, specify 
     * > `index.function_name` as the handler.
     * 
     * **defaults:* `"index.handler"`
     */
    handler(name:Field<string>){
        this._.handler=name;
        return this;
    }
    
    /**
     * **required:true**
     * 
     * **maps:** `Runtime`
     * @param runtime The runtime environment for the Lambda function 
     * that you are uploading. For valid values, see the Runtime 
     * property in the AWS Lambda Developer Guide.
     */
    Runtime(runtime:Field<runtimes>){
        this._.runtime=runtime;
        return this;
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
        if(value!=undefined){
            this._.tags[tk as string]=value
        }else{
            this._.tags=_.assign(this._.tags,tk)
        }
        return this
    }

    /**
     * **required:false**
     * 
     * **maps:** `Description`
     * @param text A description of the function.
     */
    description(text:Field<string>){
        this._.description=text;
        return this;
    }
    /**
     * **required:false**
     * @param text A string that specifies the Description field which will be 
     * added on the new lambda version resource.
     * 
     * **maps:**`VersionDescription`
     */
    versionDescription(text:Field<string>){
        this._.versionDescription=text
        return this
    }
    /**
     * **required:false**
     * 
     * **maps:** `Timeout`
     * @param duration The function execution time (in seconds) 
     * after which Lambda terminates the function. Because the 
     * execution time affects cost, set this value based on the 
     * function's expected execution time. By default, Timeout 
     * is set to 3 seconds. For more information, see the FAQs.
     */
    timeout(duration:Field<number>){
        if(typeof duration=="number"){
            duration=Math.round(duration);
        }
        this._.tiemout=duration;
        return this;
    }

    /**
     * **required:false**
     * 
     * **maps:** `MemorySize`
     * @param size The amount of memory, in MB, that is allocated 
     * to your Lambda function. Lambda uses this value to 
     * proportionally allocate the amount of CPU power. For more 
     * information, see Resource Model in the AWS Lambda Developer 
     * Guide.
     * 
     * Your function use case determines your CPU and memory 
     * requirements. For example, a database operation might need 
     * less memory than an image processing function. You must 
     * specify a value that is greater than or equal to 128, and it
     * must be a multiple of 64. You cannot specify a size larger 
     * than 3008. The default value is 128 MB.
     * 
     * will automaticaly round to the next largest multiple of 64 
     * that is above 128
     */
    memory(size:Field<number>){
        if(typeof size=="number"){
            if(size<128){
                size=128;
            }else{
                size=Math.round(size);
                size+=64-(size%64);
            }
        }
        this._.memory=size;
        return this;
    }

    /**
     * **required:false**
     * 
     * **maps:** `Role`
     * @param role The Amazon Resource Name (ARN) of the AWS Identity 
     * and Access Management (IAM) execution role that Lambda assumes 
     * when it runs your code to access AWS services.
     * 
     * If a role is not specified, one is created for you with a logical id of <function-logical-id>Role.
     */
    Role(role:Attr<Role>){
        this._.role=Attr.get(role,"Arn")
        return this;
    }
    /**
     * **required:false**
     * @param executions The maximum number of instances of your function 
     * that process events simultaneously. This option both sets the 
     * maximum concurrency for your function and reserves concurrency to 
     * ensure that it is available. For more information, see Managing 
     * Concurrency in the AWS Lambda Developer Guide.
     * 
     * **maps:** `ReservedConcurrentExecutions`
     */
    reservedConcurrentExecutions(executions:Field<number>){
        this._.reservedExecutions=executions;
        return this
    }
    /**
     * **required:false**
     * @param mode Specifies how Lambda traces a request. The default 
     * mode is PassThrough. For more information, see TracingConfig 
     * in the AWS Lambda Developer Guide.
     * 
     * **maps:** `TracingConfig.Mode`
     */
    tracingMode(mode:Field<"Active"|"PassThrough">){
        this._.tracingMode=mode;
        return this
    }
    /**
     * **required:false**
     * @param dlq The Amazon Resource Name (ARN) of a resource where 
     * Lambda delivers unprocessed events, such as an Amazon SNS topic 
     * or Amazon Simple Queue Service (Amazon SQS) queue. For the 
     * Lambda function execution role, you must explicitly provide the 
     * relevant permissions so that access to your DLQ resource is part 
     * of the execution role for your Lambda function.
     * 
     * **maps:** `DeadLetterConfig.TargetArn`
     */
    deadLetterTarget(dlq:Attr<"Arn">,type:Field<"SNS"|"SQS">){
        this._.dlq={
            TargetArn:Attr.get(dlq,"Arn"),
            Type:type
        }
        //TODO use correct Arn reference (SNS|SQS)
        return this
    }
    /**
     * **required:false**
     * @param key The Amazon Resource Name (ARN) of the AWS Key 
     * Management Service key used to encrypt your function's 
     * environment variables. If not provided, Lambda uses a default 
     * service key.
     * 
     * **maps:** `KmsKeyArn`
     */
    kmsKeyArn(key:Attr<"Arn">){
        this._.kmsArn=Attr.get(key,"Arn")
        //TODO use correct Arn reference (kms(key managemenet Service))
        return this
    }

    /**
     * For network connectivity to AWS resources in a VPC, specify a list 
     * of security groups and subnets in the VPC. When you connect a 
     * function to a VPC, it can only access resources and the internet 
     * through that VPC. For more information, see VPC Settings.
     * 
     * > **Note**
     * > 
     * > When you specify this property, AWS CloudFormation might not be 
     * > able to delete the stack if another resource in the template (such 
     * > as a security group) requires the attached ENI to be deleted 
     * > before it can be deleted. We recommend that you run AWS 
     * > CloudFormation with the ec2:DescribeNetworkInterfaces permission, 
     * > which enables AWS CloudFormation to monitor the state of the ENI 
     * > and to wait (up to 40 minutes) for Lambda to delete the ENI.
     * 
     * **required:false**
     * 
     * @param groups A list of one or more security groups IDs in the VPC 
     * that includes the resources to which your Lambda function requires 
     * access.
     * 
     * **maps:** `VocConfig.SecurityGroupIds`
     * @param subnetIds A list of one or more subnet IDs in the VPC that 
     * includes the resources to which your Lambda function requires access.
     * 
     * **maps:** `VocConfig.SubnetIds`
     */
    vpcConfig(groups:Field<string>[],subnetIds:Field<string>[]){
        this._.vpcConfig={SecurityGroupIds:groups,SubnetIds:subnetIds};
        return this
    }
    /**
     * **required:false**
     * @param permissionBoundary ARN of a permissions boundary to use for 
     * this function's execution role. This property only works if the Role 
     * is generated for you.
     * 
     * **maps:**`PermissionsBoundary`
     */
    permissionBoundary(permissionBoundary: Attr<Policy.Managed>): this {
        this._.permissionBoundary = Attr.get(permissionBoundary, "Arn");
        return this;
    }
    policies(...policies:(Field<string|PolicyOut|PolicyTemplateOut>|Policy.Document)[]){
        this._.policies.push(...policies)
        return this
    }
    //#endregion

    //#region sub resources
   /**
    * **required:false**
    * @param permissions Permissions to attach to this Function
    */
    permission(...permissions:Permission[]){
        this.permissions.push(...permissions);
        return this;
    }
    /**
     * **required:false**
     * 
     * **maps:** `Layers`
     * @param layers A list of function layers to add to the function's 
     * execution environment. Specify each layer by ARN, including the 
     * version.
     */
    layer(...layers:Attr<LambdaLayerable>[]){
        this._.layers.push(...layers.map(l => Attr.get(l,"Arn")));
        return this;
    }
    /**
     * **required:false**
     * @param versions versions to add to this function
     */
    version(...versions:Version[]){
        this.versions.push(...versions);
        return this;
    }
    /**
        * **required:false**
        * @param maps the EventMaps to add to this function
        */
    eventMapping(...maps:EventMapping[]){
        this.eventMappings.push(...maps);
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const must="you must specify the ";
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.runtime){
            errors.push(must+"Runtime");
        }
        if(!this._.handler){
            errors.push(must+"handler")
        }
        if(this._.memory && typeof this._.memory=="number" && this._.memory>3008){
            errors.push("the memory cannot be set to more than 3008");
        }
        if(this._.codeStorageMethod){
            if(this._.codeUri){
                if(typeof this._.runtime=="string" && ( this._.runtime.startsWith("python") || this._.runtime.startsWith("nodejs") )){
                    if(typeof this._.codeUri=="string" && this._.codeUri.length>4096){
                        errors.push('the code must be less than 4096 characters long')
                    }
                }else{
                    errors.push('you can only specify a CodeFile with the runtimes "python" or "nodejs"');
                }
            }
        }else{
            errors.push(must+"CodeUri or InlineCode")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            };
        }

        return this[checkCache]=callOn([
            this._,
            this.permissions,
            this.versions,
            this.eventMappings
        ],Preparable as any, (o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(stack,path,ref,this)){
            callOn([
                this._,
                this.name
            ],Preparable,o=>o[prepareQueue](stack,this,true))

            ;[
                this.permissions,
                this.versions,
                this.eventMappings
            ].forEach(v=>v.forEach(v=>v[prepareQueue](stack,this,false)))
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                CodeUri:this._.codeStorageMethod=="bucket"
                    ? {
                        Bucket:this._.bucketCode.bucket,
                        Key:this._.bucketCode.key,
                        Version:this._.bucketCode.version
                    } 
                    : this._.codeStorageMethod=="uri"
                    ? this._.codeUri
                    : undefined,
                InlineCode:this._.codeStorageMethod=="inline" ? this._.inlineCode : undefined,

                FunctionName:this._.name,
                Environment:_.size(this._.environment) 
                    ? {
                        Variables:this._.environment
                    } 
                    : undefined,
                Runtime: this._.runtime,
                Description:this._.description,
                Timeout:this._.tiemout,
                MemorySize:this._.memory,
                ReservedConcurrentExecutions:this._.reservedExecutions,
                Tracing:this._.tracingMode,
                DeadLetterQueue:this._.dlq,
                KmsKeyArn:this._.kmsArn,
                VpcConfig:this._.vpcConfig,
                Layers:notEmpty(this._.layers),
                Tags:notEmpty(this._.tags),
                VersionDescription:this._.versionDescription,
                AutoPublishAlias:this._.autoPublishAlias,
                DeploymentPreference:this._.deploymentPreference,
                Events:notEmpty(this._.events),
                PermissionsBoundary:this._.permissionBoundary,
                Policies:notEmpty(this._.policies),
                Role:this._.role,
                Handler:this._.handler
            }
        };
    }
}
export namespace ServerlessFunction{
    export const DeploymentPreference=DeplPreference
    export type DeploymentPreference=DeplPreference
}