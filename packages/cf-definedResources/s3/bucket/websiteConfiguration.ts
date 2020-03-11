import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { notEmpty, callOnCheckValid, callOnPrepareQueue, callOn } from "aws-cf-builder-core/util";
import _ from "lodash/fp"

export interface WebsiteConfigurationOut {
    ErrorDocument?: Field<string>
    IndexDocument?: Field<string>
    RedirectAllRequestsTo?: {
        HostName: Field<string>
        Protocol?: Field<string>
    }
    RoutingRules?: Field<RoutingRuleOut>[]
}
export class WebsiteConfiguration extends InlineAdvField<WebsiteConfigurationOut>{
    [resourceIdentifier] = "WebsiteConfiguration"
    private _: {
        errorDoc: Field<string>
        indexDoc: Field<string>
        redirectAll: {
            host: Field<string>
            protocol: Field<string>
        }
        rules: Field<RoutingRuleOut>[]
    } = {
        rules: []
    } as any
    constructor() { super(1) }
    /**
     * **required:false**
     * @param doc The name of the error document for the website.
     * 
     * **maps:**`ErrorDocument`
     */
    errorDocument(doc: Field<string>) {
        this._.errorDoc = doc
        return this
    }
    /**
     * **required:false**
     * @param doc The name of the index document for the website.
     * 
     * **maps:**`IndexDocument`
     */
    indexDocument(doc: Field<string>) {
        this._.indexDoc = doc
        return this
    }
    /**
     * The redirect behavior for every request to this bucket's website endpoint.
     * 
     * > **Important!**
     * > 
     * > If you specify this property, you can't specify any other property.
     * **required:false**
     * @param host The name of the error document for the website.
     * 
     * **maps:**`RedirectAllRequestsTo.Host`
     */
    redirectAllRequestsTo(host: Field<string>, protocol?: Field<"http" | "https">) {
        this._.redirectAll = { host, protocol }
        return this
    }
    routingRules(...rules: (Field<RoutingRuleOut> | RoutingRule)[]) {
        this._.rules.push(...rules)
        return this
    }
    toJSON(): WebsiteConfigurationOut {
        return {
            ErrorDocument: this._.errorDoc,
            IndexDocument: this._.indexDoc,
            RedirectAllRequestsTo: this._.redirectAll && {
                HostName: this._.redirectAll.host,
                Protocol: this._.redirectAll.protocol
            },
            RoutingRules: notEmpty(this._.rules)
        }
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        const errors:string[]=[]
        if(this._.redirectAll && (
            this._.errorDoc ||
            this._.indexDoc ||
            this._.rules.length
        )){
            errors.push("if you specify the redirectAllRequestsTo behavior then you cant specify anything else")
        }
        const out:SMap<ResourceError>={}
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache] = callOnCheckValid(this._, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._, stack, path, true)
    }
}
export interface RoutingRuleOut {
    RedirectRule: {
        HostName?: Field<string>
        HttpRedirectCode?: Field<string>
        Protocol?: Field<string>
        ReplaceKeyPrefixWith?: Field<string>
        ReplaceKeyWith?: Field<string>
    }
    RoutingRuleCondition?: {
        HttpErrorCodeReturnedEquals?: Field<string>
        KeyPrefixEquals?: Field<string>
    }
}
export class RoutingRule extends InlineAdvField<RoutingRuleOut>{
    [resourceIdentifier] = "RoutingRule"
    private _: {
        condition:{
            errorCode:Field<string>
            prefix:Field<string>
        }
        redirectCode:Field<string>
        hostName:Field<string>
        protocol:Field<string>
        replace:{
            type:"prefix"|"key"
            replacement:Field<string>
        }
    } = {condition:{}} as any
    constructor() { super(1) }
    /**
     * **required:false**
     * @param type what to replace
     * @param prefix  The object key prefix to use in the redirect request. For example, to redirect requests for all
     * pages with prefix docs/ (objects in the docs/ folder) to documents/, you can set a condition block with 
     * KeyPrefixEquals set to docs/ and in the Redirect set ReplaceKeyPrefixWith to /documents. Not required if one 
     * of the siblings is present. Can be present only if ReplaceKeyWith is not provided.
     * 
     * **maps:**`RedirectRule.ReplaceKeyPrefixWith`
     */
    replace(type:"prefix",prefix:Field<string>)
    /**
     * @param type what to replace
     * @param key The specific object key to use in the redirect request. For example, redirect request to error.html. 
     * Not required if one of the siblings is present. Can be present only if ReplaceKeyPrefixWith is not provided.
     * 
     * **maps:**`RedirectRule.ReplaceKeyPrefixWith`
     */
    replace(type:"key",key:Field<string>)
    replace(type:"prefix"|"key",replacement:Field<string>){
        this._.replace={type,replacement}
        return
    }
    /**
     * **required:false**
     * @param type the type of condition
     * @param code The HTTP error code when the redirect is applied. In the event of an error, if the error code equals 
     * this value, then the specified redirect is applied.
     * 
     * Required when parent element Condition is specified and sibling KeyPrefixEquals is not specified. If both are 
     * specified, then both must be true for the redirect to be applied.
     * 
     * **maps:**`RoutingRuleCondition.HttpErrorCodeReturnedEquals`
     */
    condition(type:"errorCode",code:Field<string>)
    /**
     * @param type the type of condition
     * @param prefix The object key name prefix when the redirect is applied. For example, to redirect requests for 
     * ExamplePage.html, the key prefix will be ExamplePage.html. To redirect request for all pages with the prefix 
     * docs/, the key prefix will be /docs, which identifies all objects in the docs/ folder.
     * 
     * Required when the parent element Condition is specified and sibling HttpErrorCodeReturnedEquals is not specified. 
     * If both conditions are specified, both must be true for the redirect to be applied.
     * 
     * **maps:**`RoutingRuleCondition.KeyPrefixEquals`
     */
    condition(type:"prefix",prefix:Field<string>)
    condition(type:string,comp:Field<string>){
        this._.condition[type]=comp
        return this
    }
    /**
     * **required:false**
     * @param code The HTTP redirect code to use on the response. Not required if one of the siblings is present.
     * 
     * **maps:**`RedirectRule.HttpRedirectCode`
     */
    redirectCode(code:Field<string>){
        this._.redirectCode=code
        return this
    }
    /**
     * **required:false**
     * @param name The host name to use in the redirect request.
     * 
     * **maps:**`RedirectRule.HostName`
     */
    hostName(name:Field<string>){
        this._.hostName=name
        return this
    }
    /**
     * **required:false**
     * @param protocol Protocol to use when redirecting requests. The default is the protocol that is used in the original request.
     * 
     * **maps:**`RedirectRule.Protocol`
     */
    protocol(protocol:Field<"http"|"https">){
        this._.protocol=protocol
    }
    toJSON(): RoutingRuleOut {
        return {
            RedirectRule:{
                HostName:this._.hostName,
                HttpRedirectCode:this._.redirectCode,
                Protocol:this._.protocol,
                ReplaceKeyPrefixWith:this._.replace.type=="prefix"
                    ? this._.replace.replacement
                    : undefined,
                ReplaceKeyWith:this._.replace.type=="key"
                    ? this._.replace.replacement
                    : undefined
            },
            RoutingRuleCondition:_.size(this._.condition)
                ? {
                    HttpErrorCodeReturnedEquals:this._.condition.errorCode,
                    KeyPrefixEquals:this._.condition.prefix
                }
                : undefined
        }
    }
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOnCheckValid(this._,{})
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOnPrepareQueue(this._,stack,path,true)
    }
}