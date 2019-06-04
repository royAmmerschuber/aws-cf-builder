import { Field, AdvField } from "../general/field";
import { SMap, generateObject, ResourceError, checkValid, prepareQueue, getStack, callFieldReferences } from "../general/general";
import _ from "lodash";
import { Module } from "../general/module";
//TODO allow Fields
/**
 * the document wich stores the PolicyStatements for a Policy
 */
export class PolicyDocument extends AdvField<string> {
    protected readonly resourceIdentifier="PolicyDocument"
    //#region parameters
    private $statements: PolicyStatement[] = [];
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
    constructor(private id?: string) {
        super(1);
     }

    //#region virtual subresources
    /**
     * **required:true**
     * 
     * **maps:** `Statement`
     * @param statements The Statement element contains an 
     * array of individual statements
     */
    statement(...statements: PolicyStatement[]) {
        this.$statements.push(...statements);
        return this;
    }
    //#endregion
    
    //#region resource functions
    protected checkValid(): SMap<ResourceError> {
        if(this.checkCache!==undefined){
            return this.checkCache
        }
        this.checkCache={}
        return this.checkCache=_.assign({},...this.$statements.map(v =>v[checkValid]()));
    }
    protected prepareQueue(mod: Module, par: SMap<any>) {
        this.$statements.forEach(v => v[prepareQueue](mod,par));
    }
    protected getName(par: SMap<any>): string {
        return this.id || "policy";
    }
    protected generateField() {
        return /* JSON.stringify */<any>({
            Version: "2012-10-17",
            Id: this.id,
            Statement: this.$statements.map(s => s[generateObject]())
        })
    }
    //#endregion
}
/**
 * a policy statement tells the Policy where it can access.
 */
export class PolicyStatement {
    protected readonly resourceIdentifier="PolicyStatement"
    private stack: string;
    //#region parameters
    private iPrincipal: boolean;
    private _principals: PrincipalOut;
    private iAction: boolean;
    private _actions: "*" | Field<string>[];
    private iResource: boolean;
    private _resources: "*" | Field<string>[] = "*"; //TODO use ARNs
    private isRestriction: boolean;
    private _sid: Field<string>;
    //#endregion

    constructor(
        sid?: Field<string>
    ) {
        this.stack=getStack(1);
        this._sid=sid
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
    principals(from: "AWS" | "Federated" | "Service", ...principals: Field<string>[]): this
    principals(from: "AWS" | "Federated" | "Service" | "*", ...principals: Field<string>[]): this {
        if (from == "*") {
            this._principals = from;
        } else {
            if (typeof this._principals == "string" || !this._principals) {
                this._principals = {
                    AWS: [],
                    Federated: [],
                    Service: []
                }
            }
            this._principals[from].push(...principals);
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
        this.iPrincipal = blacklist;
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
            this._actions = actions[0] as "*";
        } else {
            if (typeof this._actions == "string" || !this._actions) {
                this._actions = [];
            }
            this._actions.push(...actions);
        }
        return this;
    }

    /**
     * **required:false**
     * @param blacklist set if the Actions should blacklist and not whitelist
     */
    blacklistActions(blacklist: boolean = true) {
        this.iAction = blacklist;
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
    resources(...resources: Field<string>[]): this
    resources(...resources: Field<string>[]): this {
        if (resources.length == 1 && resources[0] == "*") {
            this._resources = resources[0] as "*";
        } else {
            if (typeof this._resources == "string") {
                this._resources = [];
            }
            this._resources.push(...resources);
        }
        return this;
    }

    /**
     * **required:false**
     * @param blacklist if the list of resources should be 
     * handled like a blacklist 
     */
    blacklistResources(blacklist: boolean = true) {
        this.iResource = blacklist;
        return this;
    }

    /**
     * **required:false**
     * 
     * **maps:** `Effect`
     * @param restrict if the Statement schould allow or restrict
     */
    restrict(restrict: boolean = true) {
        this.isRestriction = restrict;
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._actions){
            errors.push("you must specify atleast one action");
        }
        if(errors.length){
            out[this.stack]={
                type:this.resourceIdentifier,
                errors:errors
            };
        }
        return out;
    }
    [prepareQueue](mod:Module,par:SMap<any>) {
        _(this)
            .filter((_v,k) => k.startsWith("_"))
            .forEach(v => callFieldReferences(v,v => v[prepareQueue](mod,par)))
    }
    [generateObject](): StatementOut {
        const principals = (typeof this._principals == "string" || !this._principals) 
            ? this._principals 
            : {
                AWS: this._principals.AWS.length ? this._principals.AWS : undefined,
                Federated: this._principals.Federated.length ? this._principals.Federated : undefined,
                Service: this._principals.Service.length ? this._principals.Service : undefined,
            };
        return {
            Sid: this._sid,
            Effect: this.isRestriction ? "Deny" : "Allow",

            Principal: !this.iPrincipal ? principals : undefined,
            NotPrincipal: this.iPrincipal ? principals : undefined,

            Action: !this.iAction ? this._actions : undefined,
            NotAction: this.iAction ? this._actions : undefined,

            Resource: !this.iResource ? this._resources : undefined,
            NotResource: this.iResource ? this._resources : undefined,
        }
    }
    //#endregion
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
