import { Module } from "./module";

export const generateObject=Symbol("generateObject")
export const checkValid=Symbol("checkValid")
export const prepareQueue=Symbol("prepareQueue")
export type SMap<T>={[k:string]:T};
export interface ResourceError{
    type:string,
    errors:string[]
}

export abstract class Generatable{
    protected stacktrace:string;
    abstract [checkValid]():SMap<ResourceError>;
    abstract [prepareQueue](module:Module,param:any);
    abstract [generateObject]():any;
}