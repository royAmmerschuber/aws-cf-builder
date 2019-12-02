import _ from "lodash/fp";
import { resourceIdentifier, checkValid, stacktrace, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Tag } from "../../util";
import { Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { callOn, prepareQueueBase, notEmpty } from "aws-cf-builder-core/util";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import { SecondaryIndex, LocalSecondaryIndex, GlobalSecondaryIndex } from "./secondaryIndex";

/**
 * The AWS::DynamoDB::Table resource creates a DynamoDB table. For 
 * more information, see CreateTable in the Amazon DynamoDB API 
 * Reference.
 * 
 * You should be aware of the following behaviors when working with 
 * DynamoDB tables:
 * 
 * - AWS CloudFormation typically creates DynamoDB tables in 
 *   parallel. However, if your template includes multiple DynamoDB 
 *   tables with indexes, you must declare dependencies so that the 
 *   tables are created sequentially. Amazon DynamoDB limits the 
 *   number of tables with secondary indexes that are in the 
 *   creating state. If you create multiple tables with indexes at 
 *   the same time, DynamoDB returns an error and the stack 
 *   operation fails. For an example, see DynamoDB Table with a 
 *   DependsOn Attribute.
 * 
 * 
 * - Updates to AWS::DynamoDB::Table resources that are 
 *   associated with AWS::ApplicationAutoScaling::ScalableTarget 
 *   resources will always result in an update failure and then 
 *   an update rollback failure. The following ScalableDimension 
 *   attributes cause this problem when associated with the table:
 *     - dynamodb:table:ReadCapacityUnits
 *     - dynamodb:table:WriteCapacityUnits
 *     - dynamodb:index:ReadCapacityUnits
 *     - dynamodb:index:WriteCapacityUnits
 * 
 * As a workaround, please deregister scalable targets before 
 * performing updates to AWS::DynamoDB::Table resources.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html)
 */
export class Table extends Resource{
    readonly [resourceIdentifier]="AWS::DynamoDB::Table"

    //#region parameters
    private _:{
        name:Field<string>
        attributes:attribute[]
        capacity:ProvisionedThroughput
        tags:Tag[]
        billingMode: Field<billingMode>
        ttl: TTLSpec
        streamType: Field<StreamViewType>
        isSse: Field<boolean>
        isPit: Field<boolean>
    }={
        attributes:[],
        tags:[]
    } as any

    private secondaryIndexes:SecondaryIndex[]=[];
    //#endregion

    constructor(){super(1);}

    /**
     * **required:false**
     * 
     * **maps:** `TableName`
     * @param name A name for the table. If you don't 
     * specify a name, AWS CloudFormation generates a 
     * unique physical ID and uses that ID for the table 
     * name. For more information, see Name Type.
     * 
     * > **Important**
     * > 
     * > If you specify a name, you cannot perform updates 
     * > that require replacement of this resource. You can 
     * > perform updates that require no or some interruption. 
     * > If you must replace the resource, specify a new name.
     */
    name(name:Field<string>){
        this._.name=name
        return this
    }
    //#region simple properties
    /**
     * **required:true** at least one key
     * 
     * **maps:** `AttributeDefinitions` & `KeySchema`
     * @param type The data type for the attribute. You can specify S for 
     * string data, N for numeric data, or B for binary data.
     * 
     * **maps:** `AttributeDefinitions.AttributeType`
     * @param name The name of an attribute. Attribute names can be 1 – 255 
     * characters long and have no 
     * character restrictions.
     * 
     * **maps:** `AttributeDefinitions.AttributeName` & 
     * `KeySchema.AttributeName` & `Local/GlobalSecondaryIndexes.KeySchema.*.AttributeName` &
     * `Local/GlobalSecondaryIndexes.Projection.NonKeyAttributes.*`
     * @param secondaryIndexes a list of secondary to wich this Attribute 
     * should be connected and if its a key what type of key its supposed 
     * to be.
     * @param key Represents the attribute data, consisting 
     * of the data type and the attribute value itself. You 
     * can specify HASH or RANGE.
     * 
     * **maps:** `KeySchema.KeyType`
     */
    keys(type:attributeType, name:Field<string>, secondaryIndexes:attributeIndexRef|attributeIndexRef[], key?:keyType):this;
    /**
     * 
     * @param type The data type for the attribute. You can specify S for 
     * string data, N for numeric data, or B for binary data.
     * 
     * **maps:** `AttributeDefinitions.AttributeType`
     * @param name The name of an attribute. Attribute names can be 1 – 255 
     * characters long and have no 
     * character restrictions.
     * 
     * **maps:** `AttributeDefinitions.AttributeName` & 
     * `KeySchema.AttributeName`
     * @param key Represents the attribute data, consisting 
     * of the data type and the attribute value itself. You 
     * can specify HASH or RANGE.
     * 
     * **maps:** `KeySchema.KeyType`
     */
    keys(type:attributeType,name:Field<string>,key:keyType):this
    keys(type:attributeType, name:Field<string>, ki?:keyType|attributeIndexRef|attributeIndexRef[], key?:keyType):this{
        if(typeof ki !="string"){
            if(!(ki instanceof Array)) ki=[ki]
            this._.attributes.push({type:type,name:name,key:key})
            ki.forEach(v => {
                v.index.Attribute(name,v.key)
                if(this.secondaryIndexes.indexOf(v.index)==-1){
                    this.secondaryIndexes.push(v.index);
                }
            });
        }else{
            this._.attributes.push({type:type,name:name,key:ki});

        }
        return this;
    }
    /**
     * Throughput for the specified table, which consists of values 
     * for ReadCapacityUnits and WriteCapacityUnits. For more information 
     * about the contents of a provisioned throughput structure, see 
     * Amazon DynamoDB Table ProvisionedThroughput.
     * 
     * **required: if Billingmode == PROVISIONED**
     * @param read Sets the desired minimum number of consistent reads of items 
     * (up to 4KB in size) per second for the specified table before Amazon 
     * DynamoDB balances the load.
     * 
     * **maps:** `ProvisionedThrougput.ReadCapacityUnits`
     * @param write Sets the desired minimum number of consistent writes of 
     * items (up to 1KB in size) per second for the specified table before 
     * Amazon DynamoDB balances the load.
     * 
     * **maps:** `ProvisionedThrougput.WriteCapacityUnits`
     */
    Capacity(read:Field<number>,write:Field<number>){
        this._.capacity={
            ReadCapacityUnits:read,
            WriteCapacityUnits:write
        }
        return this;
    }
    /**
     * Specifies an arbitrary set of tags (key–value pairs) to associate with 
     * this table. Use tags to manage your resources.
     * 
     * **required:false**
     * @param tags a String map of key value pairs
     * 
     * **maps:** `Tags`
     */
    tag(tags:SMap<Field<string>>);
    /**
     * @param key  The key name of the tag. You can specify a value that is 1 
     * to 127 Unicode characters in length and cannot be prefixed with aws:. 
     * You can use any of the following characters: the set of Unicode 
     * letters, digits, whitespace, _, ., /, =, +, and -.
     * 
     * **maps:** `Tags._.Key`
     * @param value The value for the tag. You can specify a value that is 1 
     * to 255 Unicode characters in length and cannot be prefixed with aws:. 
     * You can use any of the following characters: the set of Unicode 
     * letters, digits, whitespace, _, ., /, =, +, and -.
     * 
     * **maps:** `Tags._.Value`
     */
    tag(key:Field<string>,value:Field<string>);
    tag(tag:Field<string>|SMap<Field<string>>,value?:Field<string>){
        if(value!==undefined){
            this._.tags.push({
                Key:tag as Field<string>,
                Value:value
            });
        }else{
            for(const k in tag as SMap<Field<string>>){
                this._.tags.push({
                    Key:k,
                    Value:tag[k]
                });
            }
        }
        return this;
    }
    /**
     * **required:false**
     * @param mode Specify how you are charged for read and write throughput and how 
     * you manage capacity.
     * Valid values include:
     * - PROVISIONED: Sets the billing mode to PROVISIONED. We recommend 
     *   using PROVISIONED for predictable workloads.
     * - PAY_PER_REQUEST: Sets the billing mode to PAY_PER_REQUEST. We 
     *   recommend using PAY_PER_REQUEST for unpredictable workloads.
     * 
     * If not specified, the default is PROVISIONED.
     * 
     * **maps:** `BillingMode`
     */
    billingMode(mode:Field<billingMode>){
        this._.billingMode=mode;
        return this;
    }
    /**
     * Specifies the Time to Live (TTL) settings for the table.
     * 
     * **required:false**
     * @param attributeName The name of the TTL attribute that stores the 
     * expiration time for items in the table. The name can be 1–255 characters 
     * long, and has no character restrictions.
     * 
     * **maps:** `TimeToLiveSpecification.AttributeName`
     * @param enabled Indicates whether to enable (by specifying true) or disable 
     * (by specifying false) TTL on the table.
     * 
     * **maps:** `TimeToLiveSpecification.Enabled`
     */
    ttl(attributeName:Field<string>,enabled:Field<boolean>=true){
        this._.ttl={AttributeName:attributeName,Enabled:enabled};
        return this;
    }
    /**
     * **required:false**
     * @param type Determines the information that the stream captures when an 
     * item in the table is modified. For valid values, see StreamSpecification 
     * in the Amazon DynamoDB API Reference.
     * 
     * **maps:** `StreamSpecification.StreamViewType`
     */
    streamType(type:Field<StreamViewType>){
        this._.streamType=type;
        return this;
    }
    /**
     * **required:false**
     * @param bool Whether server-side encryption is enabled or not.
     * 
     * **maps:** `SSESpecification.SSEEnabled`
     */
    sseEnabled(bool:Field<boolean>=true){
        this._.isSse=bool;
        return this;
    }
    /**
     * **required:false**
     * @param bool Indicates whether point in time recovery is enabled 
     * (true) or disabled (false) on the table.
     * 
     * **maps:** `PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled`
     */
    pointInTimeRecoveryEnabled(bool:Field<boolean>=true){
        this._.isPit=bool;
        return this;
    }
    //#endregion
    //#region virtual Subresources
    /**
     * **required:false**
     * 
     * **maps:** `GlobalSecondaryIndexes` & `LocalSecondaryIndexes`
     * @param indexes used to manually add secondary indexes. if you 
     * reference one in an attribute these will already have been added.
     */
    secondaryIndex(...indexes:SecondaryIndex[]){
        this.secondaryIndexes.push(...indexes);
        return this;
    }
    //#endregion
    //#region resource functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.attributes.filter(v=>v.key).length){
            errors.push("must atleast have one key.");
        }
        if((this._.billingMode=="PROVISIONED" || this._.billingMode==undefined) && !this._.capacity){
            errors.push("if billingMode is provisioned then you must specify a capacity for tables");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            };
        }
        return this[checkCache]=callOn([
            this._,
            this.secondaryIndexes
        ],Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean):void{
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))
            this.secondaryIndexes.forEach(i=>i[prepareQueue](stack,new PathDataCarrier(this,{
                billingMode:this._.billingMode ||"PROVISIONED"
            }),true))
        }
    }
    [generateObject](){
        const localIndexes=this.secondaryIndexes.filter(v => v instanceof LocalSecondaryIndex);
        const globalIndexes=this.secondaryIndexes.filter(v => v instanceof GlobalSecondaryIndex);
        return {
            Type:this[resourceIdentifier],
            Properties:{
                TableName: this._.name,
                AttributeDefinitions:this._.attributes.map(v=>({
                    AttributeName:v.name,
                    AttributeType:v.type
                })),
                KeySchema:this._.attributes
                    .filter(v=>v.key)
                    .map(v=>({
                        AttributeName:v.name,
                        KeyType:v.key
                    })),
                GlobalSecondaryIndexes:notEmpty(globalIndexes),
                LocalSecondaryIndexes:notEmpty(localIndexes),
                ProvisionedThroughput:this._.capacity,
                Tags: notEmpty(this._.tags),
                BillingMode:this._.billingMode,
                TimeToLiveSpecification:this._.ttl,
                StreamSpecification:this._.streamType && {
                    StreamViewType:this._.streamType
                },
                SSESpecification:this._.isSse !== undefined ? {
                    SSEEnabled:this._.isSse
                } : undefined,
                PointInTimeRecoverySpecification:this._.isPit !== undefined ? {
                    PointInTimeRecoveryEnabled:this._.isPit
                } : undefined
            }
        }
    }
    //#endregion
}
export namespace Table{
    export const LocalIndex=LocalSecondaryIndex
    export type LocalIndex=LocalSecondaryIndex

    export const GlobalIndex=GlobalSecondaryIndex
    export type GlobalIndex=GlobalSecondaryIndex
}
/**
 * an attribute of an entity in the table
 */
interface attribute{
    key?:Field<keyType>,
    name:Field<string>,
    type:Field<attributeType>
}

interface TTLSpec{ 
    AttributeName: Field<string>;
    Enabled: Field<boolean>;
}
/**
 * Describes a set of provisioned throughput values for an 
 * AWS::DynamoDB::Table resource. DynamoDB uses these capacity units 
 * to allocate sufficient resources to provide the requested throughput.
 * 
 * For a complete discussion of DynamoDB provisioned throughput values, 
 * see Specifying Read and Write Requirements in the DynamoDB Developer 
 * Guide.
 */
export interface ProvisionedThroughput{
    ReadCapacityUnits:Field<number>;
    WriteCapacityUnits:Field<number>;
}
export type keyType="HASH"|"RANGE";
export type attributeType="S"|"N"|"B";
export interface attributeIndexRef{
    index:SecondaryIndex,
    key?:keyType
}
export type StreamViewType="KEYS_ONLY"|"NEW_IMAGE"|"OLD_IMAGE"|"NEW_AND_OLD_IMAGES";
export type billingMode="PROVISIONED"|"PAY_PER_REQUEST";