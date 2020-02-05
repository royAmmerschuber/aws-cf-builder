import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Ref, Attr, callOnPrepareQueue, callOnCheckValid, notEmpty } from "aws-cf-builder-core/util";
import _ from "lodash/fp"
import { StatementOut } from "../../iam/policy/policyDocument";
import { Authorizer, Model, Api as RestApi } from "../../apiGateway";
import { Role, Policy } from "../../iam";
import { Sub } from "aws-cf-builder-core/fields/substitution";

export type EventOut =
    EventOut.S3 |
    EventOut.SNS |
    EventOut.Kinesis |
    EventOut.DynamoDB |
    EventOut.SQS |
    EventOut.Api |
    EventOut.Schedule |
    EventOut.CloudWatchEvent |
    EventOut.CloudWatchLogs |
    EventOut.IoTRule |
    EventOut.AlexaSkill |
    EventOut.Cognito
export namespace EventOut {
    export interface S3 {
        Properties: {}
        Type: Field<"S3">
    }
    export interface SNS {
        Properties: {
            FilterPolicy: {

            }
        }
        Type: Field<"SNS">
    }
    export interface Kinesis {
        Properties: {}
        Type: Field<"Kinesis">
    }
    export interface DynamoDB {
        Properties: {}
        Type: Field<"DynamoDB">
    }
    export interface SQS {
        Properties: {}
        Type: Field<"SQS">
    }
    export interface Api {
        Properties: {
            Auth?: {
                ApiKeyRequired?: Field<boolean>
                Authorizer?: Field<string>
                InvokeRole?: Field<string>
                ResourcePolicy?: {
                    AwsAccountBlacklist?: Field<string>[]
                    AwsAccountWhitelist?: Field<string>[]
                    CustomStatements?: Field<StatementOut>[]
                    IpRangeBlacklist?: Field<string>[]
                    IpRangeWhitelist?: Field<string>[]
                    SourceVpcBlacklist?: Field<string>[]
                    SourceVpcWhitelist?: Field<string>[]
                }
            }
            Method: Field<Event.Api.Method>
            Path: Field<string>
            RequestModel?: Field<any>
            RequestParameters?: Field<string> | any
            RestApiId?: Field<string>
        }
        Type: Field<"Api">
    }
    export interface Schedule {
        Properties: {}
        Type: Field<"Schedule">
    }
    export interface CloudWatchEvent {
        Properties: {}
        Type: Field<"CloudWatchEvent">
    }
    export interface CloudWatchLogs {
        Properties: {}
        Type: Field<"CloudWatchLogs">
    }
    export interface IoTRule {
        Properties: {}
        Type: Field<"IoTRule">
    }
    export interface AlexaSkill {
        Properties: {}
        Type: Field<"AlexaSkill">
    }
    export interface Cognito {
        Properties: {}
        Type: Field<"Cognito">
    }
}
export abstract class Event<T extends EventOut> extends InlineAdvField<T>{

}
export namespace Event {
    //TODO Event
    export class Api extends Event<EventOut.Api>{
        [resourceIdentifier] = "ApiEvent";
        private _: {
            method: Field<Api.Method>
            path: Field<string>
            api: Field<string>
            model: Field<string>
            params: { type: Field<string>, names: Field<string>[] }[],
            auth: {
                ApiKeyRequired: Field<boolean>
                Authorizer: Field<string>
                InvokeRole: Field<string>
                ResourcePolicy: SMap<Field<string | StatementOut>[]>
            }
        } = {
            auth: {},
            params: []
        } as any
        constructor() {
            super(2)
        }
        /**
         * **required:true**
         * @param method HTTP method for which this function is invoked.
         * 
         * **maps:**`Method`
         */
        Method(method: Field<Api.Method>) {
            this._.method = method
            return this;
        }
        /**
         * **required:true**
         * @param path Uri path for which this function is invoked. Must start with /.
         * 
         * **maps:**`Path`
         */
        Path(path: Field<string>) {
            this._.path = path
            return this;
        }

        api(api: Ref<RestApi>) {
            this._.api = Ref.get(api)
            return this
        }

        /**
         * **required:false**
         * @param auth The Authorizer for a specific Function
         *     
         * If you have specified a Global Authorizer on the API and want to make a specific 
         * Function public, override by setting Authorizer to NONE.
         * 
         * **maps:**`Auth.Authorizer`
         */
        authorizer(auth: "NONE"): this
        authorizer(auth: Ref<Authorizer>): this
        authorizer(auth: Ref<Authorizer>): this {
            this._.auth.Authorizer = Ref.get(auth)
            return this
        }
        /**
         * **required:false**
         * @param bool Requires an API key for this API path and method.
         * 
         * **maps:**`Auth.ApiKeyRequired`
         */
        apiKeyRequired(bool: boolean = true) {
            this._.auth.ApiKeyRequired = bool
            return this
        }
        /**
         * **required:false**
         * @param caller Specifies the InvokeRole to use for AWS_IAM authorization.
         * 
         * **maps:**`Auth.InvokeRole`
         */
        invokeRole(caller: "CALLER_CREDENTIALS"): this
        invokeRole(role: Attr<Role>): this
        invokeRole(role: Attr<Role>) {
            this._.auth.InvokeRole = Attr.get(role, "Arn")
            return this
        }

        /**
         * Configure Resource Policy for this path on an API.
         * 
         * **required:false**
         * @param list to what list to add the entries
         * @param items entries to add
         */
        resourcePolicy(list: Api.ResourcePolicyLists, items: Field<string>[]): this
        /**
         * 
         * @param custom to what list to add the entries 
         * @param customItems a list of statements to add
         */
        resourcePolicy(custom: "CustomStatements", customItems: (Field<StatementOut> | Policy.Statement)[]): this
        resourcePolicy(listName: string, items: (Field<string | StatementOut>)[]) {
            if (!this._.auth.ResourcePolicy) this._.auth.ResourcePolicy = {}
            const list = this._.auth.ResourcePolicy[listName]
            if (!list) {
                this._.auth.ResourcePolicy[listName] = items
            } else {
                list.push(...items)
            }
            return this
        }

        /**
         * **required:false**
         * @param model Request model to use for this specific Api+Path+Method. This should reference the 
         * name of a model specified in the Models section of an AWS::Serverless::Api resource.
         * 
         * **maps:**`RequestModel`
         */
        requestModel(model: Ref<Model>) {
            this._.model = Ref.get(model)
            return this
        }
        /**
         * Request parameters configuration for this specific Api+Path+Method. All parameter names must start 
         * with `method.request` and must be limited to `method.request.header`, `method.request.querystring`, or 
         * `method.request.path`.
         * 
         * combining the type & name with method.request will be handled for you
         * @param type the type of parameter
         * @param names the name of the parameter
         */
        requestParameter(type: Field<"header" | "querystring" | "path">, names: Field<string>[]) {
            this._.params.push({ type, names })
            return this
        }
        [checkValid](): SMap<ResourceError> {
            if (this[checkCache]) return this[checkCache]
            const out: SMap<ResourceError> = {}
            const errors: string[] = []
            if (!this._.method) {
                errors.push("must specify a method")
            }
            if (!this._.path) {
                errors.push("must specify a path")
            }
            if (!this._.api) {
                if (this._.auth.Authorizer) {
                    errors.push("you must specify an api if you want to use Authorizers")
                }
            }
            if (errors.length) {
                out[this[stacktrace]] = {
                    type: this[resourceIdentifier],
                    errors: errors
                }
            }
            return this[checkCache] = callOnCheckValid(this._, out)
        }
        [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
            callOnPrepareQueue(this._, stack, path, true)
        }
        toJSON(): EventOut.Api {
            return {
                Type: "Api",
                Properties: {
                    Method: this._.method,
                    Path: this._.path,
                    RestApiId: this._.api,
                    Auth: notEmpty(this._.auth),
                    RequestModel: this._.model,
                    RequestParameters: notEmpty(_.flatMap(({type,names})=>names.map(name=>Sub`method.request.${type}.${name}`),this._.params))
                }
            }
        }
    }
    export namespace Api {
        export type ResourcePolicyLists =
            "AwsAccountBlacklist" |
            "AwsAccountWhitelist" |
            "IpRangeBlacklist" |
            "IpRangeWhitelist" |
            "SourceVpcBlacklist" |
            "SourceVpcWhitelist"
        export type Method =
            "POST" |
            "GET" |
            "PUT" |
            "DELETE" |
            "HEAD" |
            "PATCH" |
            "OPTIONS"
    }
}