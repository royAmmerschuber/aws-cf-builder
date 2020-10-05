import { SMap, ResourceError, Aliasable } from "../general";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, getName, s_path, stacktrace, s_isAliased } from "../symbols";
import { stackPreparable } from "../stackBackend";
import { prepareQueueBase, generateUniqueIdentifier } from "../util";
import { GeneratableAdvField } from "../field";
import { pathItem } from "../path";
type ParamType = (
    "String" |
    "Number" |
    "List<Number>" |
    "CommaDelimitedList" |


    "AWS::EC2::AvailabilityZone::Name" |
    "AWS::EC2::Image::Id" |
    "AWS::EC2::Instance::Id" |
    "AWS::EC2::KeyPair::KeyName" |
    "AWS::EC2::SecurityGroup::GroupName" |
    "AWS::EC2::SecurityGroup::Id" |
    "AWS::EC2::Subnet::Id" |
    "AWS::EC2::Volume::Id" |
    "AWS::EC2::VPC::Id" |
    "AWS::Route53::HostedZone::Id" |
    "List<AWS::EC2::AvailabilityZone::Name>" |
    "List<AWS::EC2::Image::Id>" |
    "List<AWS::EC2::Instance::Id>" |
    "List<AWS::EC2::SecurityGroup::GroupName>" |
    "List<AWS::EC2::SecurityGroup::Id>" |
    "List<AWS::EC2::Subnet::Id>" |
    "List<AWS::EC2::Volume::Id>" |
    "List<AWS::EC2::VPC::Id>" |
    "List<AWS::Route53::HostedZone::Id>" |


    "AWS::SSM::Parameter::Name" |
    "AWS::SSM::Parameter::Value<String>" |
    "AWS::SSM::Parameter::Value<List<String>>" |
    "AWS::SSM::Parameter::Value<CommaDelimitedList>" |
    "AWS::SSM::Parameter::Value<AWS-specific parameter type>" |
    "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyPairName>" |
    "AWS::SSM::Parameter::Value<List<AWS-specific parameter type>>" |
    "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyPairName>>"
)
/**
 * what this outputs to the template
 */
type ParmOutTypeToTsType<T> = (
    T extends (
        "String" |

        "AWS::EC2::AvailabilityZone::Name" |
        "AWS::EC2::Image::Id" |
        "AWS::EC2::Instance::Id" |
        "AWS::EC2::KeyPair::KeyName" |
        "AWS::EC2::SecurityGroup::GroupName" |
        "AWS::EC2::SecurityGroup::Id" |
        "AWS::EC2::Subnet::Id" |
        "AWS::EC2::Volume::Id" |
        "AWS::EC2::VPC::Id" |
        "AWS::Route53::HostedZone::Id" |

        "AWS::SSM::Parameter::Name" |
        "AWS::SSM::Parameter::Value<String>" |
        "AWS::SSM::Parameter::Value<AWS-specific parameter type>" |
        "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyPairName>"
    ) ? string
    : T extends (
        "Number"
    ) ? number
    : T extends (
        "List<Number>" |
        "CommaDelimitedList" |

        "List<AWS::EC2::AvailabilityZone::Name>" |
        "List<AWS::EC2::Image::Id>" |
        "List<AWS::EC2::Instance::Id>" |
        "List<AWS::EC2::SecurityGroup::GroupName>" |
        "List<AWS::EC2::SecurityGroup::Id>" |
        "List<AWS::EC2::Subnet::Id>" |
        "List<AWS::EC2::Volume::Id>" |
        "List<AWS::EC2::VPC::Id>" |
        "List<AWS::Route53::HostedZone::Id>" |

        "AWS::SSM::Parameter::Value<List<String>>" |
        "AWS::SSM::Parameter::Value<CommaDelimitedList>" |
        "AWS::SSM::Parameter::Value<List<AWS-specific parameter type>>" |
        "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyPairName>>"
    ) ? string[]
    : any
)
/**
 * what you need to enter for a default
 */
type ParmInTypeToTsType<T> = (
    T extends (
        "String" |

        "AWS::EC2::AvailabilityZone::Name" |
        "AWS::EC2::Image::Id" |
        "AWS::EC2::Instance::Id" |
        "AWS::EC2::KeyPair::KeyName" |
        "AWS::EC2::SecurityGroup::GroupName" |
        "AWS::EC2::SecurityGroup::Id" |
        "AWS::EC2::Subnet::Id" |
        "AWS::EC2::Volume::Id" |
        "AWS::EC2::VPC::Id" |
        "AWS::Route53::HostedZone::Id" |

        "AWS::SSM::Parameter::Name" |
        "AWS::SSM::Parameter::Value<String>" |
        "AWS::SSM::Parameter::Value<List<String>>" |
        "AWS::SSM::Parameter::Value<CommaDelimitedList>" |
        "AWS::SSM::Parameter::Value<AWS-specific parameter type>" |
        "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyPairName>" |
        "AWS::SSM::Parameter::Value<List<AWS-specific parameter type>>" |
        "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyPairName>>"
    ) ? string
    : T extends (
        "Number"
    ) ? number | string
    : T extends (
        "List<Number>"
    ) ? number[] | string
    : T extends (
        "CommaDelimitedList" |

        "List<AWS::EC2::AvailabilityZone::Name>" |
        "List<AWS::EC2::Image::Id>" |
        "List<AWS::EC2::Instance::Id>" |
        "List<AWS::EC2::SecurityGroup::GroupName>" |
        "List<AWS::EC2::SecurityGroup::Id>" |
        "List<AWS::EC2::Subnet::Id>" |
        "List<AWS::EC2::Volume::Id>" |
        "List<AWS::EC2::VPC::Id>" |
        "List<AWS::Route53::HostedZone::Id>"
    ) ? string[] | string
    : any

)
const typesListStringInp = [
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
export class Parameter<T extends ParamType> extends GeneratableAdvField<ParmOutTypeToTsType<T>> implements Aliasable{
    readonly [resourceIdentifier]= "Parameter"
    private _: {
        name: string
        allowedPattern: RegExp,
        allowedValues: ParmInTypeToTsType<T>[],
        constraintDescription: string,
        default: ParmInTypeToTsType<T>,
        description: string,
        max: number,
        min: number,
        noEcho: boolean,
        type: T,
    } = {} as any
    get [s_isAliased](){
        return !!this._.name
    }
    constructor(name?: string, type?: T) {
        super(2)
        this._.name = name
        this._.type = type
    }
    name(name: string) {
        this._.name = name
        return this;
    }
    Type<U extends ParamType>(name: U): Parameter<U> {
        this._.type = name as any
        return this as any
    }
    default(val: ParmInTypeToTsType<T>) {
        this._.default = val
        return this
    }
    description(text: string) {
        this._.description = text
        return this
    }
    constraintDescription(text: string) {
        this._.constraintDescription = text
        return this
    }
    max(max: number) {
        this._.max = max
        return this
    }
    min(min: number) {
        this._.min = min
        return this
    }
    noEcho(bool = true) {
        this._.noEcho = bool
        return this
    }
    [checkValid](): SMap<ResourceError> {
        const errors: string[] = []
        if (!this._.type) {
            errors.push("you must specify a type")
        }
        if (errors.length) {
            return {
                [this[stacktrace]]: {
                    errors,
                    type: this[resourceIdentifier]
                }
            }
        }
        return {}
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        prepareQueueBase(stack, path, ref, this)
    }
    toJSON() {
        return {
            Ref: this[getName]()
        }
    }
    [generateObject]() {
        return {
            AllowedPattern: this._.allowedPattern,
            AllowedValues: this._.allowedValues,
            ConstraintDescription: this._.constraintDescription,
            Default: (() => {
                if(typeof this._.default=="string" || typeof this._.default=="number"){
                    return this._.default
                }
                else if (this._.default as any instanceof Array) {
                    if (typesListStringInp.includes(this._.type)) {
                        return (this._.default as number[]).join(",")
                    }
                }
            })(),
            Description: this._.description,
            NoEcho: this._.noEcho,
            Type: this._.type,
            ...this._.type=="Number"
                ? {
                    MaxValue: this._.max,
                    MinValue: this._.min,
                }
                : {
                    MaxLength: this._.max,
                    MinLength: this._.min,
                },
        }
    }
    [getName]() {
        return this._.name || generateUniqueIdentifier(this[s_path])
    }
}