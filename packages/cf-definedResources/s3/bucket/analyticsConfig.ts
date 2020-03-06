import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { resourceIdentifier, checkCache, checkValid, prepareQueue } from "aws-cf-builder-core/symbols"
import { Tag } from "../../util";

export interface AnalyticsConfigOut {
    Id: string,
    Prefix: string,
    StorageClassAnalysis: {
        DataExport: {
            Destination: {
                BucketAccountId: string,
                BucketArn: string,
                Format: string,
                Prefix: string
            }
            OutputSchemaVersion: string
        }
    }
    TagFilters: Tag[]
}

//TODO
export class AnalyticsConfig extends InlineAdvField<AnalyticsConfigOut>{
    [resourceIdentifier] = "AnalyticsConfig"
    toJSON() {
        throw new Error("Method not implemented.");
    }
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        throw new Error("Method not implemented.");
    }
}