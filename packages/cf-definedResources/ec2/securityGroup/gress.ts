import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace, toJson } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general"
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
export interface GressOut{
    CidrIp: Field<string>
    CidrIpv6: Field<string>
    Description: Field<string>
    FromPort: Field<number>
    IpProtocol: Field<Protocol>
    ToPort: Field<number>
}
export interface IngressOut extends GressOut {
    SourcePrefixListId: Field<string>
    SourceSecurityGroupId: Field<string>
    SourceSecurityGroupName: Field<string>
    SourceSecurityGroupOwnerId: Field<string>
}
export interface EgressOut extends GressOut {
    DestinationPrefixListId: Field<string>
    DestinationSecurityGroupId: Field<string>
}
export type Protocol="tcp"|"udp"|"icmp"|"icmpv6"|"-1"
export abstract class Gress extends InlineAdvField<IngressOut|EgressOut>{
    protected abstract _:{
        cidr:Field<string>
        cidr6:Field<string>
        description:Field<string>
        fromPort:Field<number>
        toPort:Field<number>
        protocol:Field<string>
    }
    constructor(){
        super(2)
    }
    /**
     * **required:conditional**
     * @param cidr The IPv4 address range, in CIDR format.
     * 
     * **maps:**`CidrIp`
     */
    cidrIp(cidr:Field<string>){
        this._.cidr=cidr
        return this
    }
    /**
     * **required:conditional**
     * @param cidr The IPv6 address range, in CIDR format.
     * 
     * **maps:**`CidrIpv6`
     */
    cidrIpv6(cidr:Field<string>){
        this._.cidr6=cidr
        return this
    }
    /**
     * **required:false**
     * @param text A description for the security group rule.
     * 
     * Constraints: Up to 255 characters in length. Allowed characters are a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=;{}!$*
     * 
     * **maps:**`Description`
     */
    description(text:Field<string>){
        this._.description=text
        return this
    }
    /**
     * **required:false**
     * @param port The start of port range for the TCP and UDP protocols, or an ICMP/ICMPv6 type number. A value of -1 
     * indicates all ICMP/ICMPv6 types. If you specify all ICMP/ICMPv6 types, you must specify all codes.
     * 
     * **maps:**`FromPort`
     */
    fromPort(port:Field<number>){
        this._.fromPort=port
        return this
    }
    /**
     * **required:false**
     * @param port The end of port range for the TCP and UDP protocols, or an ICMP/ICMPv6 code. A value of -1 indicates 
     * all ICMP/ICMPv6 codes. If you specify all ICMP/ICMPv6 types, you must specify all codes.
     * 
     * **maps:**`ToPort`
     */
    toPort(port:Field<number>){
        this._.toPort=port
        return this
    }
    /**
     * **required:true**
     * @param protocol The IP protocol name (tcp, udp, icmp, icmpv6) or number (see Protocol Numbers).
     * 
     * > **[VPC only]**
     * >
     * > Use -1 to specify all protocols. When authorizing security group rules, specifying -1 or a protocol number other 
     * > than tcp, udp, icmp, or icmpv6 allows traffic on all ports, regardless of any port range you specify. For tcp, udp,
     * > and icmp, you must specify a port range. For icmpv6, the port range is optional; if you omit the port range, 
     * > traffic for all types and codes is allowed.
     * 
     * **maps:**`IpProtocol`
     */
    Protocol(protocol:Field<Protocol>){
        this._.protocol=protocol
        return this
    }
    [toJson]() {
        return {
            CidrIp:this._.cidr,
            CidrIpv6:this._.cidr6,
            Description:this._.description,
            FromPort:this._.fromPort,
            IpProtocol:this._.protocol,
            ToPort:this._.toPort
        }
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }
}

export class Ingress extends Gress{
    [resourceIdentifier]="Ingress"
    protected _: Gress["_"] & {
        group:{
            id?:Field<string>
            name?:Field<string>
            ownerId:Field<string>
        }
        prefixListId
    }={ } as any
    /**
     * **required:conditional** 
     * @param id [EC2-VPC only] The prefix list IDs for an AWS service. This is the AWS service that you want to access
     * through a VPC endpoint from instances associated with the security group.
     * 
     * **maps:**`SourcePrefixListId`
     */
    sourcePrefixList(id:Field<string>){
        this._.prefixListId=id
        return this
    }
    /**
     * **required:conditional** 
     * @param type by what you want to specify the group
     * @param name [EC2-Classic, default VPC] The name of the source security group. You can't specify this parameter 
     * in combination with the following parameters: the CIDR IP address range, the start of the port range, the IP 
     * protocol, and the end of the port range. Creates rules that grant full ICMP, UDP, and TCP access. To create a 
     * rule with a specific IP protocol and port range, use a set of IP permissions instead. For EC2-VPC, the source 
     * security group must be in the same VPC.
     * 
     * **maps:**`SourceSecurityGroupName`
     * @param ownerId [nondefault VPC] The AWS account ID for the source security group, if the source security group
     * is in a different account. You can't specify this parameter in combination with the following parameters: the 
     * CIDR IP address range, the IP protocol, the start of the port range, and the end of the port range. Creates 
     * rules that grant full ICMP, UDP, and TCP access.
     * 
     * If you specify SourceSecurityGroupName or SourceSecurityGroupId and that security group is owned by a different 
     * account than the account creating the stack, you must specify the SourceSecurityGroupOwnerId; otherwise, this 
     * property is optional.
     * 
     * **maps:**`SourceSecurityGroupOwnerId`
     */
    sourceGroup(type:"name",name:Field<string>,ownerId?:Field<string>):this
    /**
     * **required:conditional** 
     * @param type by what you want to specify the group
     * @param id The ID of the security group. You must specify either the security group ID or the security group 
     * name in the request. For security groups in a nondefault VPC, you must specify the security group ID. 
     * 
     * **maps:**`SourceSecurityGroupId`
     * @param ownerId [nondefault VPC] The AWS account ID for the source security group, if the source security group
     * is in a different account. You can't specify this parameter in combination with the following parameters: the 
     * CIDR IP address range, the IP protocol, the start of the port range, and the end of the port range. Creates 
     * rules that grant full ICMP, UDP, and TCP access.
     * 
     * If you specify SourceSecurityGroupName or SourceSecurityGroupId and that security group is owned by a different 
     * account than the account creating the stack, you must specify the SourceSecurityGroupOwnerId; otherwise, this 
     * property is optional.
     * 
     * **maps:**`SourceSecurityGroupOwnerId`
     */
    sourceGroup(type:"id",id:Field<string>,ownerId?:Field<string>):this
    sourceGroup(type:"name"|"id",t:Field<string>,ownerId?:Field<string>){
        if(type=="name"){
            this._.group={
                id:t,
                ownerId 
            }
        }else{
            this._.group={
                name:t,
                ownerId 
            }
        }
        return this
    }

    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.protocol) errors.push("you must specify a protocol")
        if(
            [
                this._.group,
                this._.cidr,
                this._.cidr6,
                this._.prefixListId
            ].filter(Boolean).length!=1
        ){
            errors.push("you must speccify exactly one of sourceGroup,cidrIp,cidrIpv6,sourcePrefixList")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [toJson]() {
        return {
            ...super[toJson](),
            ...this._.group && {
                SourceSecurityGroupId:this._.group.id,
                SourceSecurityGroupName:this._.group.name,
                SourceSecurityGroupOwnerId:this._.group.ownerId
            },
            SourcePrefixListId:this._.prefixListId
        }
    }
}

export class Egress extends Gress{
    [resourceIdentifier]="Egress"
    protected _: Gress["_"] & {
        groupId:Field<string>
        prefixListId:Field<string>
    }={} as any;
    /**
     * **required:conditional**
     * @param id [EC2-VPC only] The prefix list IDs for the destination AWS service. This is the AWS service that you want to access through a VPC endpoint from instances associated with the security group.
     * 
     * **maps:**`DestinationPrefixListId`
     */
    destinationPrefixList(id:Field<string>){
        this._.prefixListId=id
        return this
    }
    /**
     * **required:conditional**
     * @param type by what you want to specify the group
     * @param id The ID of the destination VPC security group.
     * 
     * **maps:**`DestinationSecurityGroupId`
     */
    destinationGroup(type:"id",id:Field<string>){
        this._.groupId=id
        return this
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.protocol) errors.push("you must specify a protocol")
        if(
            [
                this._.cidr,
                this._.cidr6,
                this._.groupId,
                this._.prefixListId
            ].filter(Boolean).length!=1
        ){
            errors.push("you must speccify exactly one of destinationGroup,cidrIp,cidrIpv6,destionationPrefixList")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [toJson](){
        return {
            ...super[toJson](),
            DestinationPrefixListId:this._.prefixListId,
            DestinationSecurityGroupId:this._.groupId
        }
    }
}