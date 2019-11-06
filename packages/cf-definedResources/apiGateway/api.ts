
import _ from "lodash/fp";

import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { Field } from "aws-cf-builder-core/field";
import { pathItem } from "aws-cf-builder-core/path";
import { s3PathConverter } from "../util";
import { Deployment } from "./deployment";
import { Authorizer } from "./authorizer";
import { PolicyOut } from "../iam/policy/policyDocument";
import { Method } from "./method";
import { OptionsMethod } from "./method/optionsMethod";
import { checkValid, stacktrace, checkCache, generateObject, resourceIdentifier } from "aws-cf-builder-core/symbols";
import { prepareQueue } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { prepareQueueBase, callOn } from "aws-cf-builder-core/util";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { ApiResource } from "./resource";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { Preparable } from "aws-cf-builder-core/general";
import { PathDataCarrier } from "aws-cf-builder-core/path";

/**
 * resource contains a collection of Amazon API Gateway resources and methods that can be invoked through HTTPS 
 * endpoints. For more information, see 
 * [restapi:create](https://docs.aws.amazon.com//apigateway/api-reference/link-relation/restapi-create/) 
 * in the Amazon API Gateway REST API Reference.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html)
 */
export class Api extends Resource {
    readonly [resourceIdentifier] = "AWS::ApiGateway::RestApi";
    //#region parameters
    private _: {
        apiKeySourceType: Field<"HEADER" | "AUTHORIZER">,
        binaryMediaTypes: Field<string>[],
        bodyS3Location: S3Location,
        body: any,
        description: Field<string>,
        endpointConfiguration: Field<"EDGE" | "REGIONAL" | "PRIVATE">[],
        failOnWarnings: Field<boolean>,
        optionsMethodGenerator: (node: ApiNode) => Method,
        policy:Field<PolicyOut>,
        name:Field<string>
    } = {
        binaryMediaTypes: [],
        optionsMethodGenerator: node => new OptionsMethod(node)
    } as any
    private $: {
        methodTree: ApiNode
        deployments: Deployment[]
        authorizers: Authorizer[]
    } = {
        methodTree: { branch: {} },
        deployments: [],
        authorizers: []
    } as any
    //#endregion
    /**
     * the `RestApi` ID, such as `a1bcdef2gh`.
     */
    r:ReferenceField
    a = {
        /**
         * The root resource ID for a `RestApi` resource, such as `a0bc123d4e`.
         */
        RootResourceId: new AttributeField(this, "RootResourceId")
    }
    /**
     * @param name A name for the API Gateway RestApi resource.
     * 
     * **maps:** `Name`
     * 
     * **required: Conditional. Required if you don't specify a OpenAPI definition**
     * @param useName if the api should use the name
     */
    constructor() { super(2); }

    //#region simple properties
    /**
     * **maps:** `Name`
     * 
     * **required: Conditional. Required if you don't specify a OpenAPI definition**
     * @param name A name for the API Gateway RestApi resource.
     */
    public name(name:string){
        this._.name=name
        return this;
    }
    /**
     * **maps:** `ApiKeySourceType`
     * 
     * **required: false**
     * @param type The source of the API key for metering requests according to a usage plan. Valid values are:
     * - HEADER to read the API key from the X-API-Key header of a request.
     * - AUTHORIZER to read the API key from the UsageIdentifierKey from a custom authorizer.
     */
    public apiKeySourceType(type: Field<"HEADER" | "AUTHORIZER">): this {
        this._.apiKeySourceType = type;
        return this;
    }

    /**
     * **maps:** `BinaryMediaTypes`
     * 
     * **required: false**
     * @param types The list of binary media types that are supported by the RestApi resource, such as image/png or
     * application/octet-stream. By default, RestApi supports only UTF-8-encoded text payloads.
     * For more information, see Enable Support for Binary Payloads in API Gateway in the API Gateway
     * Developer Guide. Duplicates are not allowed.
     */
    public binaryMediaTypes(...types: Field<string>[]): this {
        this._.binaryMediaTypes.push(...types);
        return this;
    }

    /**
     * An OpenAPI specification that defines a set of RESTful APIs in the JSON format. For YAML templates,
     * you can also provide the specification in the YAML format
     * 
     * **maps:** `Body` or `BodyS3Location`
     * **required:Conditional. Required if you don't specify a Name**
     * @param bucketPath The Amazon Simple Storage Service (Amazon S3) location that points to an OpenAPI file, which
     * defines a set of RESTful APIs in JSON or YAML format.
     * 
     * bucket in format `s3://bucketName/folders/key:version` 
    */
    public body(bucketPath: string, etag?: string): this;
    /** @param bucket The Amazon Simple Storage Service (Amazon S3) location that points to an OpenAPI file, which
     * defines a set of RESTful APIs in JSON or YAML format.
     * 
     * **maps:** `BodyS3Location`
     */
    public body(bucket: S3Location): this;
    /** 
     * @param openApi an object representing an open Api
     * 
     * **maps:** `Body`
     */
    public body(openApi: any): this;
    public body(val: any, etag?: Field<string>): this {
        if (typeof val == "string") {
            const s3O = s3PathConverter(val);
            if (!s3O.key) throw new Error()
            this._.bodyS3Location = {
                Bucket: s3O.bucket,
                ETag: etag,
                Key: s3O.key,
                Version: s3O.version
            }
        } else if ("openapi" in val) {
            this._.body = val;
            this._.bodyS3Location = undefined;
        } else {
            this._.bodyS3Location = val;
            this._.body = undefined;
        }
        return this;
    }

    /**
     * **maps:** `Description`
     * 
     * **required: false**
     * @param desc A description of the purpose of this API Gateway RestApi resource.
     */
    public description(desc: Field<string>): this {
        this._.description = desc;
        return this;
    }

    /**
     * **maps:** `EndpointConfiguration`
     * 
     * **required: false**
     * @param types A list of the endpoint types of the API. Use this property when creating an API. 
     * When importing an existing API, specify the endpoint configuration types using the Parameters property.
     */
    public endpointConfiguration(...types: Field<"EDGE" | "REGIONAL" | "PRIVATE">[]): this {
        this._.endpointConfiguration = types;
        return this;
    }

    /**
     * **maps:** `FailOnWarnings`
     * 
     * **required: false**
     * @param bool Indicates whether to roll back the resource if a warning occurs while API Gateway is creating
     * the RestApi resource.
     * 
     * **default:true**
     */
    public failOnWarnings(bool: Field<boolean> = true): this {
        this._.failOnWarnings = bool;
        return this;
    }
    /**
     * **maps:** `Policy`
     * 
     * **required:false**
     * @param policy A policy document that contains the permissions for the RestApi resource, in JSON format. To 
     * set the ARN for the policy, use the !Join intrinsic function with "" as delimiter and values of "execute-api:/" 
     * and "*".
     */
    public policy(policy:Field<PolicyOut>){
        this._.policy=policy
        return this
    }
    //#endregion

    //#region subresources 

    /**
     * appends a new node to the tree
     * 
     * **required: false**
     * @param path path of the Method for the new node
     * @param node node to append to the structure 
     */
    public method(path: string, node: ApiNode): this {
        const splitPath = path.split("/");

        const rec = (newNode: ApiNode, oldNode: ApiNode) => {
            for (const k in newNode) {
                if (k == "branch") {
                    if (!("branch" in oldNode)) oldNode.branch = {};
                    for (const k in newNode.branch) {
                        if (!(k in oldNode.branch)) {
                            oldNode.branch[k] = newNode.branch[k];
                        } else {
                            rec(newNode.branch[k], oldNode.branch[k]);
                        }
                    }
                } else {
                    oldNode[k] = newNode[k];
                }
            }
        }
        let base = this.$.methodTree;
        if (path != "") {
            splitPath.forEach(v => {
                if (!("branch" in base)) base.branch = {};
                if (!(v in base.branch)) base.branch[v] = {};
                base = base.branch[v];
            });
        }
        rec(node, base);
        return this;
    }
    /**
     * **required: false**
     * @param deployment adds a new Deployment to the Api
     */
    public deployment(...deployments: Deployment[]): this {
        this.$.deployments.push(...deployments);
        return this;
    }
    /**
     * **required: false**
     * @param authorizers adds a new Authorizer to the Api. you dont have to specify an Authorizer here 
     * if you specify one in a method of this Api.
     */
    public authorizer(...authorizers: Authorizer[]) {
        this.$.authorizers.push(...authorizers);
        return this;
    }
    /**
     * set the generator for the standard options Method.
     * @param func function to generate Method
     * 
     * **defult**:
     * ```javascript
     * (node) => new OptionsMethod(node)
     * ```
     */
    public optionsMethodGenerator(func: (node: ApiNode) => Method): this {
        this._.optionsMethodGenerator = func;
        return this;
    }
    //#endregion

    //#region resource functions
    public [checkValid]() {
        if (this[checkCache]) {
            return this[checkCache]
        }
        const out: SMap<ResourceError> = {}
        const errors: string[] = []

        let treeErrors: SMap<ResourceError> = {};
        let hasMethod: boolean = false;
        function checkNode(node: ApiNode): boolean {
            for (const k in node) {
                if (k != "branch") {
                    hasMethod = true;
                    const f: Method = node[k];
                    treeErrors = _.assign(treeErrors, f[checkValid]())
                } else {
                    for (const bk in node[k]) {
                        const n = node[k][bk];
                        checkNode(n);
                    }
                }
            }
            return true;
        }

        checkNode(this.$.methodTree);
        if (!(this.name || this._.body || this._.bodyS3Location)) {
            errors.push("you must set a name or specify a body");
        }
        if (this.$.deployments.length && !hasMethod) {
            errors.push("if your Gateway has Deployments then you must specify a Method");
        }

        if (errors.length) {
            out[this[stacktrace]] = {
                errors: errors,
                type: this[resourceIdentifier]
            }
        }
        return this[checkCache] = [
            ...callOn([
                this._,
                this.name,
                this.$.authorizers,
                this.$.deployments
            ], Preparable as any, v => v[checkValid]() as SMap<ResourceError>),
            treeErrors
        ].reduce<SMap<ResourceError>>(_.assign, out)
    }
    public [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean) {
        if (prepareQueueBase(stack, path, ref, this)) {
            let fMethod: ReferenceField;
            const prepareTree = (node: ApiNode, resource?: ApiResource) => {
                let hasMethods = false;
                const subPath = resource || this
                for (const k in node) {
                    let e = node[k];
                    switch (k) {
                        case "branch": {
                            for (const pathSeg in e) {
                                const n: ApiNode = e[pathSeg];
                                const r = new ApiResource(pathSeg);
                                r[prepareQueue](stack, subPath, false);
                                prepareTree(n, r);
                            }
                        } break;
                        case "OPTIONS": break;
                        default: {
                            hasMethods = true;
                            (e as Method)[prepareQueue](stack, new PathDataCarrier(subPath,{
                                method:k
                            }), false);
                            if (!fMethod) fMethod = (e as Method).r;
                        }
                    }
                }
                if (node.OPTIONS === undefined) {
                    if (!hasMethods) return;
                    this._.optionsMethodGenerator(node)[prepareQueue](stack, new PathDataCarrier(subPath,{
                        method:"OPTIONS"
                    }), false);
                } else if (node.OPTIONS !== null) {
                    node.OPTIONS[prepareQueue](stack, subPath, false);
                }
            };
            prepareTree(this.$.methodTree);
            const deplCarrier = new PathDataCarrier(this, {
                fMethod: fMethod
            })
            this.$.deployments.forEach((d) => {
                d[prepareQueue](stack, deplCarrier, false)
            });
            this.$.authorizers.forEach((a) => {
                a[prepareQueue](stack, this, false)
            });

            callOn([
                this._,
                this.name,
            ], Preparable as any, (obj: Preparable) => {
                obj[prepareQueue](stack, this, true)
            })
        }
    }
    public [generateObject]() {
        return {
            Type: this[resourceIdentifier],
            Properties: {
                Name: this._.name,
                ApiKeySourceType: this._.apiKeySourceType,
                BinaryMediaTypes: this._.binaryMediaTypes.length ? this._.binaryMediaTypes : undefined,
                Body: this._.body,
                BodyS3Location: this._.bodyS3Location,
                Description: this._.description,
                EndpointConfiguration: this._.endpointConfiguration,
                FailOnWarnings: this._.failOnWarnings,
                Policy: this._.policy
            }
        }
    }

    //#endregion
}
type Methods = { [k in
    "POST" |
    "GET" |
    "PUT" |
    "DELETE" |
    "HEAD" |
    "PATCH"
    ]?: Method }
/**
 * a node of the Api tree
 * contains methods and other branches
 */
export interface ApiNode extends Methods {
    /**
     * a map of subNodes from this node
     */
    branch?: SMap<ApiNode>
    /**
     * if undefined then it will autogenerate one
     * if null it will not generate one
     * if Method it will use your custom method
     */
    "OPTIONS"?: Method | null;
}

/**
 * S3Location is a property of the AWS::ApiGateway::RestApi resource that specifies the Amazon Simple Storage
 * Service (Amazon S3) location of a OpenAPI (formerly Swagger) file that defines a set of RESTful APIs in 
 * JSON or YAML for an Amazon API Gateway (API Gateway) RestApi.
 */
export interface S3Location {
    /** The name of the S3 bucket where the OpenAPI file is stored. */
    Bucket: Field<string>;
    /**
     *  The Amazon S3 ETag (a file checksum) of the OpenAPI file. If you don't specify a value, API Gateway 
     * skips ETag validation of your OpenAPI file. 
     */
    ETag?: Field<string>;
    /** The file name of the OpenAPI file (Amazon S3 object name). */
    Key: Field<string>;
    /** For versioning-enabled buckets, a specific version of the OpenAPI file. */
    Version?: Field<string>;
}
