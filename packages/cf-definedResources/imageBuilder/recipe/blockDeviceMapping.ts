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
    constructor(){
        super(1)
    }
    /**
     * **required:false**
     * @param name The device to which these mappings apply.
     * 
     * **maps:**`DeviceName`
     */
    deviceName(name:Field<string>){
        this._.deviceName=name
        return this
    }
    /**
     * **required:false**
     * @param name Manages the instance ephemeral devices.
     * 
     * **maps:**`VirtualName`
     */
    virtualName(name:Field<string>){
        this._.virtualName=name
        return this
    }
    /**
     * **required:false**
     * @param bool Removes a mapping from the parent image
     * 
     * **maps:**`NoDevice`
     */
    remove(bool=true){
        this._.remove=bool
        return this
    }
    /**
     * **required:false**
     * @param bool Configures delete on termination of the associated device.
     * 
     * **maps:**`Ebs.DeleteOnTermination`
     */
    deleteOnTermination(bool:Field<boolean>=true){
        this._.ebs.deleteOnTermination=bool
        return this
    }
    /**
     * **required:false**
     * @param bool Use to configure device encryption.
     * 
     * **maps:**`Ebs.Encrypted`
     */
    encrypted(bool:Field<boolean>=true){
        this._.ebs.encrypted=bool
        return this
    }
    /**
     * **required:false**
     * @param num Use to configure device IOPS.
     * 
     * **maps:**`Ebs.Iops`
     */
    iops(num:Field<number>){
        this._.ebs.iops=num
        return this
    }
    /**
     * **required:false**
     * @param num Overrides the volume size of the device.
     * 
     * **maps:**`Ebs.VolumeSize`
     */
    volumeSize(num:Field<number>){
        this._.ebs.volumeSize=num
        return this
    }
    /**
     * **required:false**
     * @param type Overrides the volume type of the device.
     * 
     * **maps:**`Ebs.VolumeType`
     */
    volumeType(type:Field<VolumeType>){
        this._.ebs.volumeType=type
        return this
    }
    /**
     * **required:false**
     * @param id Use to configure the KMS key to use when encrypting the device.
     * 
     * **maps:**`Ebs.KmsKeyId`
     */
    kmsKey(id:Attr<"KeyId">){//TODO KMS
        this._.ebs.kmsKey=Attr.get(id,"KeyId")
        return this
    }
    /**
     * **required:false**
     * @param id The snapshot that defines the device contents.
     * 
     * **maps:**`Ebs.SnapshotId`
     */
    snapshotId(id:Field<string>){ //TODO EC2
        this._.ebs.snapshot=id
        return this
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