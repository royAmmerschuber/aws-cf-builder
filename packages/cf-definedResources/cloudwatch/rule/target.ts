import _ from "lodash/fp";
import { Field, InlineAdvField, isAdvField } from "aws-cf-builder-core/field";
import { SMap, Preparable, ResourceError } from "aws-cf-builder-core/general";
import { resourceIdentifier, checkValid, stacktrace, checkCache, prepareQueue } from "aws-cf-builder-core/symbols";
import { Attr, callOn } from "aws-cf-builder-core/util";
import { Role } from "../../iam";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
/**
 * The Target property type specifies a target, such as AWS Lambda 
 * (Lambda) functions or Kinesis streams, that CloudWatch Events 
 * invokes when a rule is triggered.
 * 
 * The Targets property of the AWS::Events::Rule resource contains a 
 * list of one or more Target property types.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-target.html)
 */
export class Target extends InlineAdvField<TargetOut>{
    readonly [resourceIdentifier]="RuleTarget"
    //#region Parameters
    private _:{
        id:Field<string>
        ecsCount: Field<number>
        ecsTaskDefinition: Field<string>
        arn: Field<string>
        input: Field<string>
        inputPath: Field<string>
        inputTransformer: {InputTemplate:Field<string>,InputPathsMap?:SMap<Field<string>>}
        kinesisPath: Field<string>
        role: Field<string>
        runCommandTargets: {Key:Field<string>,Values:Field<string>[]}[]
        sqsMessageGroup: Field<string>
    }={
        runCommandTargets:[]
    } as any
    //#endregion
    constructor(){
        super(1)
    }
    /**
     * **required:true**
     * @param id A unique, user-defined identifier for the target. 
     * Acceptable values include alphanumeric characters, periods (.), 
     * hyphens (-), and underscores (_).
     * 
     * **maps:**`Id`
     */
    Id(id:Field<string>){
        this._.id=id
        return this
    }
    //#region simple properties
    /**
     * **required:true**
     * @param arn The Amazon Resource Name (ARN) of the target.
     * 
     * **maps:**`Arn`
     */
    Arn(arn:Attr<"Arn">){
        this._.arn=Attr.get(arn,"Arn")
        return this;
    }
    /**
     * The Amazon ECS task definition and task count to use, if the 
     * event target is an Amazon ECS task.
     * 
     * **required:false**
     * @param taskDefinition The Amazon Resource Name (ARN) of the task 
     * definition to use.
     * 
     * **maps:**`EcsParameters.TaskDefinitionArn`
     * @param count The number of tasks to create based on the task 
     * definition. The default is 1.
     * 
     * **maps:**`EcsParameters.TaskCount`
     */
    //TODO Arn to ARN<ECS>
    ecsTask(taskDefinition:Attr<"Arn">,count?:Field<number>){
        this._.ecsTaskDefinition=Attr.get(taskDefinition,"Arn")
        this._.ecsCount=count;
        return this;
    }
    /**
     * **required:false**
     * @param input A JSON-formatted text string that is passed to the 
     * target. This value overrides the matched event.
     * 
     * **maps:**`Input`
     */
    input(input:Field<string>):this;
    /**
     * @param input A JSON-object that is passed to the target. This value 
     * overrides the matched event.
     * 
     * If you don't specify both this property and the InputPath property, 
     * CloudWatch Events passes the entire matched event to the target.
     * **maps:**`Input`
     */
    input(input:any):this;
    input(input:any){
        if(typeof input=="string" || isAdvField(input)){ 
            this._.input=input;
        }else{
            this._.input=JSON.stringify(input);
        }
        return this;
    }
    /**
     * **required:false**
     * @param path When you don't want to pass the entire matched event, the 
     * JSONPath that describes which part of the event to pass to the target.
     * 
     * If you don't specify both this property and the Input property, 
     * CloudWatch Events passes the entire matched event to the target.
     * 
     * **maps:**`InputPath`
     */
    inputPath(path:Field<string>){
        this._.inputPath=path;
        return this;
    }
    /**
     * Settings that provide custom input to a target based on certain event
     * data. You can extract one or more key-value pairs from the event, and
     * then use that data to send customized input to the target.
     * 
     * **required:false**
     * @param JSONtemplate The input template where you can use the values of the 
     * keys from InputPathsMap to customize the data that's sent to the target.
     * 
     * **maps:**`InputTransformer.InputTemplate`
     * @param pathMapping The map of JSON paths to extract from the event, as 
     * key-value pairs where each value is a JSON path. You must use JSON dot 
     * notation, not bracket notation. Duplicates aren't allowed.
     * 
     * **maps:**`InputTransformer.InputPathsMap`
     */
    inputTransformer(JSONtemplate:Field<string>,pathMapping?:SMap<Field<string>>):this;
    /** 
     * Settings that provide custom input to a target based on certain event
     * data. You can extract one or more key-value pairs from the event, and
     * then use that data to send customized input to the target.
     * 
     * @param template The input template where you can use the values of the 
     * keys from InputPathsMap to customize the data that's sent to the target.
     * 
     * **maps:**`InputTransformer.InputTemplate`
     * @param pathMapping The map of JSON paths to extract from the event, as 
     * key-value pairs where each value is a JSON path. You must use JSON dot 
     * notation, not bracket notation. Duplicates aren't allowed.
     * 
     * **maps:**`InputTransformer.InputPathsMap`
     */
    inputTransformer(template:any,pathMapping?:SMap<Field<string>>):this;
    inputTransformer(template:any,pathMapping?:SMap<Field<string>>){
        this._.inputTransformer={
            InputTemplate:typeof template=="string" || isAdvField(template)
                ? template
                : JSON.stringify(template),
            InputPathsMap:pathMapping
        }
        return this;
    }
    /**
     * Settings that control shard assignment, when the target is a Kinesis 
     * stream. If you don't include this parameter, eventId is used as the 
     * partition key.
     * 
     * **required:false**
     * @param keyPath The JSON path to extract from the event and use as the 
     * partition key. The default is to use the eventId as the partition key. 
     * For more information, see Amazon Kinesis Streams Key Concepts in the 
     * Kinesis Streams Developer Guide.
     * 
     * **maps:**`KinesisParameters.PartitionKeyPath`
     */
    kinesisPath(keyPath:Field<string>){
        this._.kinesisPath=keyPath;
        return this;
    }
    /**
     * Parameters used when the rule invokes the AWS Systems Manager Run Command.
     * 
     * **required:false**
     * @param map The criteria (either InstanceIds or a tag) that specifies which 
     * EC2 instances the command is sent to.
     * 
     * **maps:**`RunCommandParameters.RunCommandTargets`
     */
    runCommandTargets(map:SMap<Field<string>[]>):this;
    /**
     * @param key The key, either tag: tag-key or InstanceIds.
     * 
     * **maps:**`RunCommandParameters.RunCommandTargets._.Key`
     * @param value A list of tag values or EC2 instance IDs.
     * 
     * **maps:**`RunCommandParameters.RunCommandTargets._.Value`
     */
    runCommandTargets(key:Field<string>,value:Field<string>[]):this;
    runCommandTargets(key:Field<string>|SMap<Field<string>[]>,value?:Field<string>[]){
        if(value){
            this._.runCommandTargets.push({
                Key:key as Field<string>,
                Values:value
            })
        }else {
            this._.runCommandTargets.push(..._.flow(
                _.toPairs,
                _.map(([k,v]:[string,Field<string>[]])=>({
                    Key:k,
                    Values:v
                }))
            )(key as SMap<Field<string>[]>))
        }
        return this;
    }
    /**
     * Specifies the message group ID to use when the target is 
     * a FIFO queue.
     * 
     * If you specify an Amazon SQS FIFO queue as a target, the 
     * queue must have content-based deduplication enabled.
     * 
     * **required:false**
     * @param id The FIFO message group ID to use as the target.
     * 
     * **maps:**`SqsParameters.MessageGroupId`
     */
    //TODO change to Ref
    sqsMessageGroup(id:Field<string>){
        this._.sqsMessageGroup=id;
        return this;
    }
    //#endregion

    //#region sub resources
    /**
     * **required:false**
     * @param arn The Amazon Resource Name (ARN) of the AWS Identity and 
     * Access Management (IAM) role to use for this target when the rule 
     * is triggered. If one rule triggers multiple targets, you can use 
     * a different IAM role for each target.
     * 
     * > **Note**
     * > 
     * > CloudWatch Events needs appropriate permissions to make API calls 
     * > against the resources you own. For Kinesis streams, CloudWatch 
     * > Events relies on IAM roles. For Lambda, Amazon SNS, and Amazon SQS 
     * > resources, CloudWatch Events relies on resource-based policies. For 
     * > more information, see Using Resource-Based Policies for CloudWatch 
     * > Events in the Amazon CloudWatch User Guide.
     * 
     * **maps:**`RoleArn`
     */
    role(arn:Attr<Role>){
        this._.role=Attr.get(arn,"Arn");
        return this;
    }

    //#endregion

    //#region resource Functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.id){
            errors.push("you must specify an Id")
        }
        if(!this._.arn){
            errors.push("you must specify an Arn")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        //TODO Arn to Arn<ECS>
        return this[checkCache]=callOn(this._,Preparable,(o)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }

    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        callOn(this._,Preparable,o=> o[prepareQueue](stack,path,true))
    }
    toJSON():TargetOut{
        return {
            Id:this._.id,
            Arn:this._.arn,
            EcsParameters:this._.ecsTaskDefinition && {
                TaskDefinitionArn:this._.ecsTaskDefinition,
                TaskCount:this._.ecsCount
            },
            Input:this._.input,
            InputPath:this._.inputPath,
            InputTransformer:this._.inputTransformer,
            KinesisParameters:this._.kinesisPath && {
                PartitionKeyPath:this._.kinesisPath
            },
            RoleArn:this._.role,
            RunCommandParameters:this._.runCommandTargets.length ? {
                RunCommandTargets:this._.runCommandTargets
            } : undefined,
            SqsParameters:this._.sqsMessageGroup && {
                MessageGroupId:this._.sqsMessageGroup
            }
        }
    }
    //#endregion
}
export interface TargetOut{
    Id:Field<string>
    Arn:Field<string>
    EcsParameters:{
        TaskDefinitionArn:Field<string>,
        TaskCount:Field<number>
    },
    Input:Field<string>
    InputPath:Field<string>
    InputTransformer:{
        InputTemplate:Field<string>
        InputPathsMap?:SMap<Field<string>>
    }
    KinesisParameters:{
        PartitionKeyPath:Field<string>
    },
    RoleArn:Field<string>
    RunCommandParameters?:{
        RunCommandTargets:{Key:Field<string>,Values:Field<string>[]}[]
    },
    SqsParameters:{
        MessageGroupId:Field<string>
    }
}