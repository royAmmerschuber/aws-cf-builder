import _ from "lodash/fp";
import { InlineAdvField, Field } from "aws-cf-builder-core/field"
import { resourceIdentifier, checkValid, stacktrace, checkCache, prepareQueue } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, Preparable, PreparableError } from "aws-cf-builder-core/general";
import { callOn, Attr } from "aws-cf-builder-core/util";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";

/**
 * the document wich stores the PolicyStatements for a Policy
 */
export class PolicyDocument extends InlineAdvField<PolicyOut>{
    readonly [resourceIdentifier] = "PolicyDocument"
    //#region parameters
    private statements: Field<StatementOut>[] = [];
    //#endregion

    /**
     * @param id The Id element specifies an optional identifier 
     * for the policy. The ID is used differently in different 
     * services.
     * 
     * For services that let you set an ID element, we recommend 
     * you use a UUID (GUID) for the value, or incorporate a UUID 
     * as part of the ID to ensure uniqueness.
     * 
     * > **Note**
     * > 
     * > Some AWS services (for example, Amazon SQS or Amazon SNS) 
     * > might require this element and have uniqueness requirements 
     * > for it. For service-specific information about writing 
     * > policies, refer to the documentation for the service you're 
     * > working with.
     */
    constructor(private id?: Field<string>) {
        super(1)
    }

    //#region virtual subresources
    /**
     * **required:true**
     * 
     * **maps:** `Statement`
     * @param statements The Statement element contains an 
     * array of individual statements
     */
    Statement(...statements: Field<StatementOut>[]) {
        this.statements.push(...statements);
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        if (this[checkCache]) return this[checkCache]

        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (!this.statements.length) {
            errors.push("you must at least specify one PolicyStatement");
        }

        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors: errors
            };
        }

        return this[checkCache] = callOn([this.id, this.statements], Preparable as any, (o: Preparable) => o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean) {
        callOn([this.id, this.statements], Preparable as any, (o: Preparable) => o[prepareQueue](stack, path, true))
    }
    toJSON(): PolicyOut {
        return {
            Version: "2012-10-17",
            Id: this.id,
            Statement: this.statements
        }
    }
    //#endregion
}
/**
 * a policy statement tells the Policy where it can access.
 */
export class PolicyStatement extends InlineAdvField<StatementOut>{
    readonly [resourceIdentifier] = "PolicyStatement"
    private _: {
        notPrincipal: boolean
        principals: PrincipalOut
        notAction: boolean
        actions: "*" | Field<string>[]
        notResource: boolean
        resources: "*" | Field<string>[]
        isRestriction: boolean;
    } = {
        resources: "*"
    } as any


    constructor(
        private sid?: Field<string>
    ) {
        super(1)
    }

    //#region simple properties
    /**
     * Use the Principal element to specify the user (IAM user, 
     * federated user, or assumed-role user), AWS account, 
     * AWS service, or other principal entity that is allowed 
     * or denied access to a resource. You use the Principal 
     * element in the trust policies for IAM roles and in 
     * resource-based policies—that is, in policies that you 
     * embed directly in a resource. For example, you can embed 
     * such policies in an Amazon S3 bucket, an Glacier vault, 
     * an Amazon SNS topic, an Amazon SQS queue, or an AWS KMS 
     * customer master key (CMK).
     * 
     * **required:false**
     * 
     * **maps:** `Principal` | `NotPrincipal`
     * @param universal allows everything to access this statement
     */
    principals(universal: "*"): this;
    /**
     * @param from the type of resource you want to give these permissions to
     * @param principals the resources you want to give the permissions to
     */
    principals(from: "AWS" | "Federated" | "Service", ...principals: string[]): this
    principals(from: "AWS" | "Federated" | "Service" | "*", ...principals: string[]): this {
        if (from == "*") {
            this._.principals = from;
        } else {
            if (typeof this._.principals == "string" || !this._.principals) {
                this._.principals = {
                    AWS: [],
                    Federated: [],
                    Service: []
                }
            }
            this._.principals[from].push(...principals);
        }
        return this;
    }

    /**
     * **required:false**
     * @param blacklist set if the Principal identifiers should
     * be a blacklist.
     * 
     * switches the Principal parameters from the `Principal` 
     * Field to the `NotPrincipal` Field
     */
    blacklistPrincipals(blacklist: boolean = true) {
        this._.notPrincipal = blacklist;
        return this;
    }

    /**
     * **required:true**
     * 
     * **maps:** `Action` | `NotAction`
     * @param universal allows all actions
     */
    Actions(universal: "*"): this
    /**
     * @param actions The Action element describes the specific 
     * action or actions that will be allowed or denied. 
     * Statements must include either an Action or NotAction 
     * element. Each AWS service has its own set of actions that 
     * describe tasks that you can perform with that service. 
     * For example, the list of actions for Amazon S3 can be 
     * found at Specifying Permissions in a Policy in the Amazon 
     * Simple Storage Service Developer Guide, the list of actions 
     * for Amazon EC2 can be found in the Amazon EC2 API Reference, 
     * and the list of actions for AWS Identity and Access Management 
     * can be found in the IAM API Reference. To find the list of 
     * actions for other services, consult the API reference 
     * documentation for the service.
     * 
     * You specify a value using a namespace that identifies a service 
     * (iam, ec2 sqs, sns, s3, etc.) followed by the name of the 
     * action to allow or deny. The name must match an action that is 
     * supported by the service. The prefix and the action name are 
     * case insensitive. For example, iam:ListAccessKeys is the same 
     * as IAM:listaccesskeys. The following examples show Action 
     * elements for different services.
     */
    Actions(...actions: Field<string>[]): this;
    Actions(...actions: Field<string>[]): this {
        if (actions.length == 1 && actions[0] == "*") {
            this._.actions = actions[0] as "*";
        } else {
            if (typeof this._.actions == "string" || !this._.actions) {
                this._.actions = [];
            }
            this._.actions.push(...actions);
        }
        return this;
    }

    /**
     * **required:false**
     * @param blacklist set if the Actions should blacklist and not whitelist
     */
    blacklistActions(blacklist: boolean = true) {
        this._.notAction = blacklist;
        return this;
    }
    //TODO use ARNs for resources
    /**
     * **required: false**
     * 
     * **maps:** `Resource` | `NotResource`
     * @param universal allow access to all resources
     */
    resources(universal: "*"): this
    /**
     * @param resources The Resource element specifies the object 
     * or objects that the statement covers. Statements must 
     * include either a Resource or a NotResource element. You 
     * specify a resource using an ARN. (For more information 
     * about the format of ARNs, see Amazon Resource Names (ARNs) 
     * and AWS Service Namespaces.)
     * 
     * Each service has its own set of resources. Although you 
     * always use an ARN to specify a resource, the details of 
     * the ARN for a resource depend on the service and the 
     * resource. For information about how to specify a resource, 
     * refer to the documentation for the service whose resources 
     * you're writing a statement for.
     */
    resources(...resources: Attr<"Arn">[]): this
    resources(...resources: Attr<"Arn">[]): this {
        if (resources.length == 1 && resources[0] == "*") {
            this._.resources = resources[0] as "*";
        } else {
            if (typeof this._.resources == "string") {
                this._.resources = [];
            }
            this._.resources.push(...resources.map(r => Attr.get(r,"Arn")))
        }
        return this;
    }

    /**
     * **required:false**
     * @param blacklist if the list of resources should be 
     * handled like a blacklist 
     */
    blacklistResources(blacklist: boolean = true) {
        this._.notResource = blacklist;
        return this;
    }

    /**
     * **required:false**
     * 
     * **maps:** `Effect`
     * @param restrict if the Statement schould allow or restrict
     */
    restrict(restrict: boolean = true) {
        this._.isRestriction = restrict;
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (!this._.actions) {
            errors.push("you must specify atleast one action");
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors: errors
            };
        }
        return callOn([this._, this.sid], Preparable as any, (o: Preparable) => o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean) {
        callOn([this._, this.sid], Preparable as any, (o: Preparable) => o[prepareQueue](stack, path, true))
        if(path instanceof PathDataCarrier && path.data.skipResources){
            if(this._.resources!="*" && this._.resources!=undefined) throw new PreparableError(this,"do not specify a resource for a Assume Policy")
            this._.resources=undefined
        }
    }
    toJSON(): StatementOut {
        const principals = (typeof this._.principals == "string" || !this._.principals)
            ? this._.principals
            : {
                AWS: this._.principals.AWS.length ? this._.principals.AWS : undefined,
                Federated: this._.principals.Federated.length ? this._.principals.Federated : undefined,
                Service: this._.principals.Service.length ? this._.principals.Service : undefined,
            };
        return {
            Sid: this.sid,
            Effect: this._.isRestriction ? "Deny" : "Allow",

            Principal: !this._.notPrincipal ? principals : undefined,
            NotPrincipal: this._.notPrincipal ? principals : undefined,

            Action: !this._.notAction ? this._.actions : undefined,
            NotAction: this._.notAction ? this._.actions : undefined,

            Resource: !this._.notResource ? this._.resources : undefined,
            NotResource: this._.notResource ? this._.resources : undefined,
        }
    }
    //#endregion
}
export interface PolicyOut {
    Version: "2012-10-17",
    Id?: Field<string>,
    Statement: Field<StatementOut>[],

}
export interface StatementOut {
    Sid?: Field<string>,
    Effect: "Allow" | "Deny",

    Principal?: PrincipalOut,
    NotPrincipal?: PrincipalOut,

    Action?: "*" | Field<string>[],
    NotAction?: "*" | Field<string>[],

    Resource?: "*" | Field<string>[],
    NotResource?: "*" | Field<string>[],

    Condition?: SMap<any>;
}
type PrincipalOut = "*" | {
    [K in "AWS" | "Federated" | "Service"]: Field<string>[]
};
