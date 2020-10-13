import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, prepareQueue, resourceIdentifier, toJson } from "aws-cf-builder-core/symbols";
import { Attr, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
import _ from "lodash/fp";
export interface BlockDeviceMappingOut{
    DeviceName?: Field<string>
    Ebs?: {
        DeleteOnTermination?: Field<boolean>
        Encrypted?: Field<boolean>
        Iops?: Field<number>
        KmsKeyId?: Field<string>
        SnapshotId?: Field<string>
        VolumeSize?: Field<number>
        VolumeType?: Field<string>
    }
    NoDevice?: Field<string>
    VirtualName?: Field<string>
}
export type VolumeType=
    "gp2" |
    "io1" |
    "io2" |
    "sc1" |
    "st1" |
    "standard"
//TODO
export class BlockDeviceMapping extends InlineAdvField<BlockDeviceMappingOut>{
    [resourceIdentifier]="BlockDeviceMapping";
    private _:{
        deviceName:Field<string>
        virtualName:Field<string>
        remove:boolean
        ebs:{
            deleteOnTermination:Field<boolean>
            encrypted:Field<boolean>
            iops:Field<number>
            volumeSize:Field<number>
            volumeType:Field<string>
            snapshot:Field<string>
            kmsKey:Field<string>
        }
    }={ebs:{}} as any
    deviceName(name:Field<string>){
        this._.deviceName=name
        return this
    }
    virtualName(name:Field<string>){
        this._.virtualName=name
        return this
    }
    remove(bool=true){
        this._.remove=bool
        return this
    }

    deleteOnTermination(bool:Field<boolean>=true){
        this._.ebs.deleteOnTermination=bool
        return this
    }
    encrypted(bool:Field<boolean>=true){
        this._.ebs.encrypted=bool
        return this
    }
    iops(num:Field<number>){
        this._.ebs.iops=num
        return this
    }
    volumeSize(num:Field<number>){
        this._.ebs.volumeSize=num
        return this
    }
    volumeType(type:Field<VolumeType>){
        this._.ebs.volumeType=type
        return this
    }
    kmsKey(id:Attr<"KeyId">){//TODO KMS
        this._.ebs.kmsKey=Attr.get(id,"KeyId")
        return this
    }
    snapshotId(id:Field<string>){ //TODO EC2
        this._.ebs.snapshot=id
        return this
    }
    constructor(){
        super(1)
    }
    [toJson]():BlockDeviceMappingOut {
        return {
            DeviceName:this._.deviceName,
            VirtualName:this._.virtualName,
            NoDevice:this._.remove ? "" : undefined,
            Ebs:_.size(this._.ebs) ? {
                DeleteOnTermination:this._.ebs.deleteOnTermination,
                Encrypted:this._.ebs.encrypted,
                Iops:this._.ebs.iops,
                KmsKeyId:this._.ebs.kmsKey,
                SnapshotId:this._.ebs.snapshot,
                VolumeSize:this._.ebs.volumeSize,
                VolumeType:this._.ebs.volumeType
            } : undefined
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache];
        return this[checkCache]=callOnCheckValid(this._,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }
}