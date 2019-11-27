
import { ProvisionedThroughput } from ".";
import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, stacktrace, prepareQueue, checkCache, pathName } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, Preparable, PreparableError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, namedPath, PathDataCarrier } from "aws-cf-builder-core/path";
import { callOn } from "aws-cf-builder-core/util";
import _ from "lodash/fp"

export abstract class SecondaryIndex extends InlineAdvField<SecondaryIndexOut> implements namedPath{
    protected _:{
        name:Field<string>
        projectionType: Field<projectionType>
        attributes:siAttribute[]
    }={
        attributes:[]
    } as any
    constructor(){
        super(1)
    }
    /**
     * **required:true**
     * 
     * @param name The name of the local secondary index.
     * 
     * Length constraints: Minimum of 3. Maximum of 255.
     * 
     * **maps:** `IndexName`
     */
    Name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:true**
     * @param type The set of attributes that are projected into the index:
     * 
     * - `KEYS_ONLY` Only the index and primary keys are projected into the 
     *   index.
     * 
     * - `INCLUDE` Only the specified table attributes are projected into 
     *   the index. The list of projected attributes are in 
     *   NonKeyAttributes.
     * 
     * - `ALL` All of the table attributes are projected into the index.
     * 
     * **maps:** `Projection.ProjectionType`
     */
    ProjectionType(type:Field<projectionType>){
        this._.projectionType=type;
        return this;
    }
    /**
     * 
     * **required:true (only one key)**
     * @param name the name of the key or Attribute
     * 
     * **maps:** `KeySchema.*.AttributeName` | `Projection.NonKeyAttributes.*`
     * @param key the type of key
     * 
     * **maps:** `KeySchema.*.KeyType`
     */
    Attribute(name:Field<string>,key?:Field<"HASH"|"RANGE">){
        this._.attributes.push({
            name:name,
            key:key
        });
        return this;
    }
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.name){
            errors.push("you must specify a name")
        }
        if(!this._.attributes.filter(v=>v.key).length){
            errors.push("must atleast have one key.");
        }
        if(!this._.projectionType){
            errors.push("must specify a projection type")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOn(this._,Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,path,true))
    }
    toJSON():SecondaryIndexOut{
        const projectedAttributes=this._.attributes.filter(v => !v.key);
        return {
            IndexName:this._.name,
            KeySchema:this._.attributes.filter(v => v.key).map(v => ({
                AttributeName:v.name,
                KeyType:v.key
            })),
            Projection:{
                NonKeyAttributes:projectedAttributes.length 
                    ? projectedAttributes.map(v => v.name) 
                    : undefined,
                ProjectionType:this._.projectionType
            },
        }
    }
    [pathName](){
        if(typeof this._.name!="string") return ""
        return this._.name
    }
}
/**
 * Global secondary indexes to be created on the table. You can create up to 20 
 * global secondary indexes.
 * 
 * > **Important**
 * > 
 * > If you update a table to include a new global secondary index, AWS 
 * > CloudFormation initiates the index creation and then proceeds with the stack 
 * > update. AWS CloudFormation doesn't wait for the index to complete creation 
 * > because the backfilling phase can take a long time, depending on the size 
 * > of the table. You can't use the index or update the table until the index's 
 * > status is ACTIVE. You can track its status by using the DynamoDB 
 * > DescribeTable command.
 * > 
 * > If you add or delete an index during an update, we recommend that you don't 
 * > update any other resources. If your stack fails to update and is rolled back 
 * > while adding a new index, you must manually delete the index.
 */
export class GlobalSecondaryIndex extends SecondaryIndex{
    readonly [resourceIdentifier]="GlobalSecondaryIndex";
    protected _:SecondaryIndex["_"] & {
        capacity:ProvisionedThroughput
    }
    /**
     * The provisioned throughput settings for the index.
     * 
     * **required:false**
     * @param read Sets the desired minimum number of consistent reads 
     * of items (up to 4KB in size) per second for the specified table 
     * before Amazon DynamoDB balances the load.
     * 
     * **maps:** `ProvisionedThroughput.ReadCapacityUnits`
     * @param write Sets the desired minimum number of consistent 
     * writes of items (up to 1KB in size) per second for the 
     * specified table before Amazon DynamoDB balances the load.
     * 
     * **maps:** `ProvisionedThroughput.ReadCapacityUnits`
     */
    capacity(read:Field<number>,write:Field<number>){
        this._.capacity={
            ReadCapacityUnits:read,
            WriteCapacityUnits:write
        }
        return this;
    }
    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        super[prepareQueue](stack,path,ref)
        if(path instanceof PathDataCarrier && "billingMode" in path.data){
            if(path.data.billingMode=="PROVISIONED" && !this._.capacity){
                throw new PreparableError(this,"if billingMode is PROVISIONED then you must specify a capacity for global secondary indexes")
            }
        }
    }
    toJSON(){
        const out=super.toJSON()
        out.ProvisionedThroughput=this._.capacity
        return out
    }
}
/**
 * Local secondary indexes to be created on the table. You can create up to 5 
 * local secondary indexes. Each index is scoped to a given hash key value. 
 * The size of each hash key can be up to 10 gigabytes.
 */
export class LocalSecondaryIndex extends SecondaryIndex{
    readonly [resourceIdentifier]="LocalSecondaryIndex";
}

export type projectionType="KEYS_ONLY"|"INCLUDE"|"ALL";

interface siAttribute{
    name:Field<string>,
    key?:Field<"HASH"|"RANGE">,
}
interface SecondaryIndexOut{
    IndexName:Field<string>
    KeySchema:{
        AttributeName:Field<string>
        KeyType:Field<string>
    }[]
    Projection:{
        NonKeyAttributes:Field<string>[]
        ProjectionType:Field<string>
    }
    ProvisionedThroughput?:ProvisionedThroughput
}