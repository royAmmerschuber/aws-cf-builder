import { Field } from "aws-cf-builder-core/field";

export function s3PathConverter(path:string):{bucket:string,key?:string,version?:string}{
    if(!path.toLowerCase().startsWith("s3://")) throw new Error("this is not a valid s3 string");
    const out:any={};
    path=path.slice(5);
    const split=path.indexOf("/");
    const version=path.indexOf(":");
    if(split>=0){
        out.bucket=path.slice(0,split);
        if(version<0){
            out.key=path.slice(split+1);
        }else{
            out.key=path.slice(split+1,version);
            out.version=path.slice(version+1);
        }
    }else{
        out.bucket=path;
    }
    return out;
}
export interface Tag{
    Key:Field<string>,
    Value:Field<string>
}
export type AwsRegion=
    "us-east-2" |
    "us-east-1" |
    "us-west-1" |
    "us-west-2" |
    "af-south-1" |
    "ap-east-1" |
    "ap-south-1" |
    "ap-northeast-3" |
    "ap-northeast-2" |
    "ap-southeast-1" |
    "ap-southeast-2" |
    "ap-northeast-1" |
    "ca-central-1" |
    "cn-north-1" |
    "cn-northwest-1" |
    "eu-central-1" |
    "eu-west-1" |
    "eu-west-2" |
    "eu-south-1" |
    "eu-west-3" |
    "eu-north-1" |
    "me-south-1" |
    "sa-east-1" |
    "us-gov-east-1" |
    "us-gov-west-1" 