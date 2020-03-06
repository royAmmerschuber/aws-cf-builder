import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { resourceIdentifier,checkCache,checkValid,prepareQueue} from "aws-cf-builder-core/symbols"

export interface CorsRuleOut {
    AllowedHeaders?: Field<string>[]
    AllowedMethods: Field<string>[]
    AllowedOrigins: Field<string>[]
    ExposedHeaders?: Field<string>[]
    Id?: Field<string>[]
    MaxAge?: number
}
//TODO
export class CorsRule extends InlineAdvField<CorsRuleOut>{
    [resourceIdentifier]="CorsRule";
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        throw new Error("Method not implemented.");
    }
    toJSON() {
        throw new Error("Method not implemented.");
    }    
}
export type CorsMethod="GET"|"PUT"|"HEAD"|"POST"|"DELETE"