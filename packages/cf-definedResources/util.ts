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