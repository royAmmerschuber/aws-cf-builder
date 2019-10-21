import { SMap, ResourceError, pathItem } from "../general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, getName, s_path, generateExpression, stacktrace } from "../symbols";
import { modulePreparable } from "../stackBackend";
import { prepareQueueBase, generateUniqueIdentifier } from "../util";
import { GeneratableAdvField } from "../field";
type ParamType=(
    "String"|
    "Number"|
    "List<Number>"|
    "CommaDelimitedList"|


    "AWS::EC2::AvailabilityZone::Name"|
    "AWS::EC2::Image::Id"|
    "AWS::EC2::Instance::Id"|
    "AWS::EC2::KeyPair::KeyName"|
    "AWS::EC2::SecurityGroup::GroupName"|
    "AWS::EC2::SecurityGroup::Id"|
    "AWS::EC2::Subnet::Id"|
    "AWS::EC2::Volume::Id"|
    "AWS::EC2::VPC::Id"|
    "AWS::Route53::HostedZone::Id"|
    "List<AWS::EC2::AvailabilityZone::Name>"|
    "List<AWS::EC2::Image::Id>"|
    "List<AWS::EC2::Instance::Id>"|
    "List<AWS::EC2::SecurityGroup::GroupName>"|
    "List<AWS::EC2::SecurityGroup::Id>"|
    "List<AWS::EC2::Subnet::Id>"|
    "List<AWS::EC2::Volume::Id>"|
    "List<AWS::EC2::VPC::Id>"|
    "List<AWS::Route53::HostedZone::Id>"|


    "AWS::SSM::Parameter::Name"|
    "AWS::SSM::Parameter::Value<String>"|
    "AWS::SSM::Parameter::Value<List<String>>"| 
    "AWS::SSM::Parameter::Value<CommaDelimitedList>"|
    "AWS::SSM::Parameter::Value<AWS-specific parameter type>"|
    "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyPairName>"|
    "AWS::SSM::Parameter::Value<List<AWS-specific parameter type>>"|
    "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyPairName>>"
)
/**
 * what this outputs to the template
 */
type ParmOutTypeToTsType<T>=(
    T extends (
        "string"|

        "AWS::EC2::AvailabilityZone::Name"|
        "AWS::EC2::Image::Id"|
        "AWS::EC2::Instance::Id"|
        "AWS::EC2::KeyPair::KeyName"|
        "AWS::EC2::SecurityGroup::GroupName"|
        "AWS::EC2::SecurityGroup::Id"|
        "AWS::EC2::Subnet::Id"|
        "AWS::EC2::Volume::Id"|
        "AWS::EC2::VPC::Id"|
        "AWS::Route53::HostedZone::Id"|
        
        "AWS::SSM::Parameter::Name"|
        "AWS::SSM::Parameter::Value<String>"|
        "AWS::SSM::Parameter::Value<AWS-specific parameter type>"|
        "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyPairName>"
    ) ? string
    : T extends (
        "Number"
    ) ? number
    : T extends (
        "List<Number>"|
        "CommaDelimitedList"|

        "List<AWS::EC2::AvailabilityZone::Name>"|
        "List<AWS::EC2::Image::Id>"|
        "List<AWS::EC2::Instance::Id>"|
        "List<AWS::EC2::SecurityGroup::GroupName>"|
        "List<AWS::EC2::SecurityGroup::Id>"|
        "List<AWS::EC2::Subnet::Id>"|
        "List<AWS::EC2::Volume::Id>"|
        "List<AWS::EC2::VPC::Id>"|
        "List<AWS::Route53::HostedZone::Id>"|

        "AWS::SSM::Parameter::Value<List<String>>"| 
        "AWS::SSM::Parameter::Value<CommaDelimitedList>"|
        "AWS::SSM::Parameter::Value<List<AWS-specific parameter type>>"|
        "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyPairName>>"
    ) ? string[]
    : any
)
/**
 * what you need to enter for a default
 */
type ParmInTypeToTsType<T>=(
    T extends (
        "string"|

        "AWS::EC2::AvailabilityZone::Name"|
        "AWS::EC2::Image::Id"|
        "AWS::EC2::Instance::Id"|
        "AWS::EC2::KeyPair::KeyName"|
        "AWS::EC2::SecurityGroup::GroupName"|
        "AWS::EC2::SecurityGroup::Id"|
        "AWS::EC2::Subnet::Id"|
        "AWS::EC2::Volume::Id"|
        "AWS::EC2::VPC::Id"|
        "AWS::Route53::HostedZone::Id"|

        "AWS::SSM::Parameter::Name"|
        "AWS::SSM::Parameter::Value<String>"|
        "AWS::SSM::Parameter::Value<List<String>>"| 
        "AWS::SSM::Parameter::Value<CommaDelimitedList>"|
        "AWS::SSM::Parameter::Value<AWS-specific parameter type>"|
        "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyPairName>"|
        "AWS::SSM::Parameter::Value<List<AWS-specific parameter type>>"|
        "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyPairName>>"
    ) ? string
    : T extends (
        "Number"
    ) ? number
    : T extends (
        "List<Number>"
    ) ? number[]|string
    : T extends (
        "CommaDelimitedList"|

        "List<AWS::EC2::AvailabilityZone::Name>"|
        "List<AWS::EC2::Image::Id>"|
        "List<AWS::EC2::Instance::Id>"|
        "List<AWS::EC2::SecurityGroup::GroupName>"|
        "List<AWS::EC2::SecurityGroup::Id>"|
        "List<AWS::EC2::Subnet::Id>"|
        "List<AWS::EC2::Volume::Id>"|
        "List<AWS::EC2::VPC::Id>"|
        "List<AWS::Route53::HostedZone::Id>"
    ) ? string[]|string
    : any

)
const typesListStringInp=[
    "CommaDelimitedList",
    "List<AWS::EC2::AvailabilityZone::Name>",
    "List<AWS::EC2::Image::Id>",
    "List<AWS::EC2::Instance::Id>",
    "List<AWS::EC2::SecurityGroup::GroupName>",
    "List<AWS::EC2::SecurityGroup::Id>",
    "List<AWS::EC2::Subnet::Id>",
    "List<AWS::EC2::Volume::Id>",
    "List<AWS::EC2::VPC::Id>",
    "List<AWS::Route53::HostedZone::Id>",

    "List<Number>"
]
export class Parameter<T extends ParamType> extends GeneratableAdvField<ParmOutTypeToTsType<T>>{
    readonly [resourceIdentifier]:"Parameter"
    private _:{
        name:string
        allowedPattern:RegExp,
        allowedValues:ParmInTypeToTsType<T>[],
        constraintDescription:string,
        default:ParmInTypeToTsType<T>,
        description:string,
        max:number,
        min:number,
        noEcho:boolean,
        type:T,
    }={} as any
    constructor(name?:string,type?:T){
        super(0)
        this._.name=name
        this._.type=type
    }
    name(name:string){
        this._.name=name
        return this;
    }
    Type<U extends ParamType>(name:U):Parameter<U>{
        this._.type=name as any
        return this as any
    }
    default(val:ParmInTypeToTsType<T>){
        this._.default=val
        return this
    }
    description(text:string){
        this._.description=text
        return this
    }
    constraintDescription(text:string){
        this._.constraintDescription=text
        return this
    }
    max(max:number){
        this._.max=max
        return this
    }
    min(min:number){
        this._.min=min
        return this
    }
    noEcho(bool=true){
        this._.noEcho=bool
        return this
    }
    [checkValid](): SMap<ResourceError> {
        const errs:string[]=[]
        if(!this._.type){
            errs.push("you must specify a type")
        }
        if(errs.length){
            return {
                [this[stacktrace]]:{
                    errors:errs,
                    type:this[resourceIdentifier]
                }
            }
        }
        return {}
    }
    [prepareQueue](mod: modulePreparable, path: pathItem,ref:boolean): void {
        prepareQueueBase(mod,path,ref,this)
    }
    toJSON(){
        return {
            Ref:this[getName]()
        } as any
    }
    [generateObject]() {
        return {
            AllowedPattern:this._.allowedPattern,
            AllowedValues:this._.allowedValues,
            ConstraintDescription:this._.constraintDescription,
            Default:(()=>{
                //TODO WIP
                if(typeof this._.default!="string"){
                    if(typesListStringInp.includes(this._.type)){
                        return (this._.default as number[]).join(",")
                    }
                }
            })(),
            Description:this._.description,
            MaxLength:this._.max,
            MaxValue:this._.max,
            MinLength:this._.min,
            MinValue:this._.min,
            NoEcho:this._.noEcho,
            Type:this._.type
        }
    }
    [getName](){
        return this._.name || generateUniqueIdentifier(this[s_path])
    }
}