import _ from "lodash/fp";

import { Resource } from "aws-cf-builder-core/generatables/resource";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { Tag, s3PathConverter } from "../util";
import { Attr, callOn, prepareQueueBase } from "aws-cf-builder-core/util";
import { checkValid, prepareQueue, generateObject, stacktrace, checkCache, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Permission } from "./permission";
import { Layer } from "./layer";
import { Version } from "./version"
import { EventMapping } from "./eventMapping";
import { Alias } from "./alias";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { Role } from "../iam/role";

/**
 * The AWS::Lambda::Function resource creates an AWS Lambda (Lambda) 
 * function that can run code in response to events. For more 
 * information, see CreateFunction in the AWS Lambda Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html)
 */
export class LambdaFunction extends Resource{
    readonly [resourceIdentifier]="AWS::Lambda::Function"

    //#region parameters
    private _:{
        bucketCode:{bucket:Field<string>,key:Field<string>,version?:Field<string>}
        codeFile:Field<string>
        codeStorageMethod: "bucket"|"file"
        environment:SMap<Field<string>>
        handler: Field<string>
        runtime: Field<runtimes>
        tags:Tag[]
        description: Field<string>
        tiemout: Field<number>
        memory: Field<number>
        reservedExecutions: Field<number>
        tracingMode: Field<string>
        vpcConfig: { 
            SecurityGroupIds: Field<string>[],
            SubnetIds: Field<string>[];
        }
        name:Field<string>

        role: Field<string>
        dlTarget: Field<string>
        kmsArn: Field<string>
        layers:Field<string>[]
    }={
        tags:[],
        handler:"index.handler",
        environment:{},
        layers:[]
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
        /**
         * The Amazon Resource Name (ARN) of the function.
         */
        Arn:new AttributeField(this,"Arn")
    }
    
    constructor(){super(1)}
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
     * The source code of your Lambda function. You can point to a 
     * file in an Amazon Simple Storage Service (Amazon S3) bucket 
     * or specify your source code as inline text.
     * 
     * **required:true**
     * 
     * **maps:** `Code`
     * @param path bucket in format `s3://bucketName/folders/key:version` 
     * or the code as text
     * 
     * **maps:** `Code.ZipFile` | (`Code.S3Bucket` & `Code.S3Key` & `Code.S3ObjectVersion`)
     */
    Code(path:Field<string>):this;
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
     * **maps:** `Code.S3Bucket`
     * @param key The location and name of the .zip file that contains 
     * your source code. If you specify this property, you must also 
     * specify the S3Bucket property.
     * 
     * **maps:** `Code.S3Key`
     * @param version If you have S3 versioning enabled, the version 
     * ID of the.zip file that contains your source code. You can 
     * specify this property only if you specify the S3Bucket and S3Key 
     * properties.
     * 
     * **maps:** `Code.S3ObjectVersion`
     */
    Code(bucket:Field<string>,key:Field<string>,version?:Field<string>):this;
    Code(bp:Field<string>,key?:Field<string>,version?:Field<string>):this{
        if(key){
            this._.bucketCode={
                bucket:bp as Field<string>,
                key:key,
                version:version
            }
            this._.codeStorageMethod="bucket";
            return this;
        }else if (typeof bp=="string"){
            let code;
            try{
                code=s3PathConverter(bp);
                
            }catch{
                this._.codeFile=bp;
                this._.codeStorageMethod="file";
                return this;
            }
            if(!("key" in code))throw new Error("must specify a key");
            this._.bucketCode=code;
            this._.codeStorageMethod="bucket";
            return this;
        }
        this._.codeFile=bp;
        this._.codeStorageMethod="file";
        return this;
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
     * **required:true**
     * 
     * **maps:** `Role`
     * @param role The Amazon Resource Name (ARN) of the AWS Identity 
     * and Access Management (IAM) execution role that Lambda assumes 
     * when it runs your code to access AWS services.
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
    deadLetterTarget(dlq:Attr<"Arn">){
        this._.dlTarget=Attr.get(dlq,"Arn")
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
    layer(...layers:Attr<Layer>[]){
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
        if(!this._.role){
            errors.push(must+"role");
        }
        if(this._.memory && typeof this._.memory=="number" && this._.memory>3008){
            errors.push("the memory cannot be set to more than 3008");
        }
        if(!this._.bucketCode){
            if(this._.codeFile){
                if(typeof this._.runtime=="string" && ( this._.runtime.startsWith("python") || this._.runtime.startsWith("nodejs") )){
                    if(typeof this._.codeFile=="string" && this._.codeFile.length>4096){
                        errors.push('the code must be less than 4096 characters long')
                    }
                }else{
                    errors.push('you can only specify a CodeFile with the runtimes "python" or "nodejs"');
                }
            }else{
                errors.push(must+"Code");
            }
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            };
        }

        return this[checkCache]=callOn([
            this._,
            this.name,
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
            ],Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))

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
                Code:this._.codeStorageMethod=="bucket"
                    ? {
                        S3Bucket:this._.bucketCode.bucket,
                        S3Key:this._.bucketCode.key,
                        S3ObjectVersion:this._.bucketCode.version
                    } 
                    : {
                        ZipFile:this._.codeFile
                    },
                FunctionName:this._.name,
                Environment:_.size(this._.environment) 
                    ? {
                        Variables:this._.environment
                    } 
                    : undefined,
                Handler:this._.handler,
                Role:this._.role,
                Runtime: this._.runtime,
                Description:this._.description,
                Timeout:this._.tiemout,
                MemorySize:this._.memory,
                ReservedConcurrentExecutions:this._.reservedExecutions,
                TracingConfig:this._.tracingMode && {
                    Mode:this._.tracingMode
                },
                DeadLetterConfig:this._.dlTarget && {
                    TargetArn:this._.dlTarget
                },
                KmsKeyArn:this._.kmsArn,
                VpcConfig:this._.vpcConfig,
                Layers:this._.layers.length ? this._.layers : undefined,
                Tags:this._.tags.length ? this._.tags : undefined
            }
        };
    }
}

/**
 * the types of runtime that a Lambda function can have
 */
export type runtimes=
    "dotnetcore1.0" |
    "dotnetcore2.1" |
    "go1.x" |
    "java8" |
    "nodejs10.x" |
    "nodejs8.10" |
    "provided" |
    "python2.7" |
    "python3.6" |
    "python3.7" |
    "ruby2.5"
;

export type LambdaExecutable=LambdaFunction|Version|Alias;