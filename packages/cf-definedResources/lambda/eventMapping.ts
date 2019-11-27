import _ from "lodash/fp"
import { resourceIdentifier, checkValid, checkCache, stacktrace, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Attr, callOn, prepareQueueBase, findInPath } from "aws-cf-builder-core/util";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { LambdaFunction } from "./function";
import { Version } from "./version";
import { Alias } from "./alias";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
/**
 * The AWS::Lambda::EventSourceMapping resource creates a mapping 
 * between an event source and an AWS Lambda function. Lambda reads 
 * items from the event source and triggers the function. For more 
 * information, see AWS Lambda Event Source Mapping in the AWS 
 * Lambda Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-eventsourcemapping.html)
 */
export class EventMapping extends Resource{
    readonly [resourceIdentifier]="AWS::Lambda::EventSourceMapping";
    //#region properties
    private _:{
        eventSource: Field<string>;
        enabled: Field<boolean>;
        start: Field<startingPosition>;
        batchsize: Field<number>;

        functionName:Field<string>
    }={} as any
    //#endregion

    /**
     * the mapping's ID.
     */
    r:ReferenceField
    /**
     * @param name only used for logical id
     * 
     * **default:**`"main"`
     */
    constructor(
        private name:string="main"
    ){super(1)};

    //#region simple properties
    /**
     * **required:false**
     * @param bool Set to false to pause polling and invocation.
     * 
     * **maps:** `Enabled`
     */
    enabled(bool:Field<boolean>=true){
        this._.enabled=bool;
        return this;
    }

    /**
     * **required:false**
     * @param pos The position in a stream from which to start reading. 
     * Required for Amazon Kinesis and Amazon DynamoDB Streams sources. 
     * AT_TIMESTAMP is only supported for Kinesis streams.
     * 
     * **maps:** `StartingPosition`
     */
    startingPosition(pos:Field<startingPosition>){
        this._.start=pos;
        return this;
    }
    /**
     * **required:false**
     * @param size The maximum number of items to retrieve in a single batch.
     * - **Amazon Kinesis** – Default 100. Max 10,000.
     * - **Amazon DynamoDB Streams** – Default 100. Max 1,000.
     * - **Amazon Simple Queue Service** – Default 10. Max 10.
     * 
     * **maps:** `BatchSize`
     */
    batchSize(size:Field<number>){
        this._.batchsize=size;
        return this;
    }
    //#endregion

    //#region subresources
    /**
     * **required:true**
     * @param arn The Amazon Resource Name (ARN) of the event source.
     * - **Amazon Kinesis** – The ARN of the data stream or a stream consumer.
     * - **Amazon DynamoDB Streams** – The ARN of the stream.
     * - **Amazon Simple Queue Service** – The ARN of the queue.
     * 
     * **maps:** `EventSourceArn`
     */
    EventSource(arn:Attr<"Arn">){
        this._.eventSource=Attr.get(arn,"Arn");
        return this;
    }
    //#endregion
    [checkValid]() {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.eventSource){
            errors.push("you must specify an EventSource");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOn(this._,Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out);
    }
    [prepareQueue](stack:stackPreparable, path:pathItem,ref:boolean) {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))

            const found =findInPath(path,{func:LambdaFunction,ver:Version,alias:Alias})
            
            const first=_.sortBy("depth",found)[0].obj
            this._.functionName=first.r
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                FunctionName:this._.functionName,
                EventSourceArn:this._.eventSource,
                BatchSize:this._.batchsize,
                Enabled:this._.enabled,
                StartingPosition:this._.start
            }
        }
    }
}

export type startingPosition="TRIM_HORIZON"|"LATEST"|"AT_TIMESTAMP";