import {Field} from "./general/field"
import {Provider} from "./general/provider"
import {Module} from "./general/module"
import { checkValid, ResourceError, SMap, prepareQueue, generateObject, resourceIdentifier } from "./general/general"

export class Aws extends Provider{
    protected readonly [resourceIdentifier]="aws"

    private _accessKey:Field<string>
    private _dynamodbEndpoint:Field<string>
    private _kinesisEndpoint:Field<string>
    private _profile:Field<string>
    private _region:Field<string>
    private _secretKey:Field<string>
    private _sharedCredentialsFile:Field<string>
    private _token:Field<string>
    [checkValid]():SMap<ResourceError>{
        throw ""
    }

    [prepareQueue](mod:Module,param:any){
        throw ""
    }

    [generateObject](){

    }
}
