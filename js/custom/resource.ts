import { Resource } from "../general/resource";
import { CustomPropFunction } from "./provider";
import { resourceIdentifier, checkValid, prepareQueue, generateObject, SMap, ResourceError } from "../general/general";
import { Module } from "../general/module";
import _ from "lodash";

class customResource extends Resource{
    protected [resourceIdentifier]: string;
    propertyHolder:SMap<any>={};
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](module: Module, param: any): void {
        throw new Error("Method not implemented.");
    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
    private handler={

    }
    constructor(provider:string,name:string){
        super(0)
        this[resourceIdentifier]=_.snakeCase(name)
        return new Proxy(this,this.handler)
    }
}

export function CustomResource(provider:string,name:string):CustomResource{
    return new customResource(provider,name) as any
}
export interface CustomParameters{
    [k:string]:CustomPropFunction<this>
}
export type CustomResource=customResource & CustomParameters