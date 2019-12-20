import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Ref, Attr, notEmpty, callOn } from "aws-cf-builder-core/util";
import { LambdaExecutable } from "../../lambda/function";
import { Role } from "../../iam";
import _ from "lodash/fp";

export interface DeploymentPreferenceOut{
    Alarms?:Field<string>[]
    Enabled?:Field<boolean>
    Hooks?:{
        PostTraffic:Field<string>
        PreTraffic:Field<string>
    }
    Role?:Field<string>
    Type:Field<"Linear"|"Canary">
}
export class DeploymentPreference extends InlineAdvField<DeploymentPreferenceOut>{
    [resourceIdentifier]="DeploymentPreference"
    private _:{
        alarms:Field<string>[]
        enabled:Field<boolean>
        postHook:Field<string>
        preHook:Field<string>
        role:Field<string>
        type:Field<string>
    }={
        alarms:[]
    } as any
    constructor(){super(1)}
    /**
     * **required:false**
     * @param alarms A list of CloudWatch alarms that you want to be
     * triggered by any errors raised by the deployment.
     * 
     * **maps:**`Alarms`
     */
    alarms(...alarms:Field<string>[]){//TODO use Cloudwatch Alarm Ref
        this._.alarms.push(...alarms.map(Ref.get))
        return this
    }
    /**
     * **required:false**
     * @param bool Whether this deployment preference is enabled.
     * 
     * **maps:**`Enabled`
     * 
     * **default:**`true`
     */
    enabled(bool:Field<boolean>=true){
        this._.enabled=bool
        return this
    }
    /**
     * Validation Lambda functions that are run before and after traffic shifting.
     * 
     * **required:false**
     * @param pre run before traffic shifting
     * 
     * **maps:**`Hooks.PreTraffic`
     * @param post run after traffic shifting
     * 
     * **maps:**`Hooks.PostTraffic`
     */
    hooks(pre:Attr<LambdaExecutable>,post?:Attr<LambdaExecutable>):this
    /**
     * @param hooks the hooks for pre and post traffic shifting
     */
    hooks(hooks:{pre?:Attr<LambdaExecutable>,post?:Attr<LambdaExecutable>}):this
    hooks(po:{pre?:Attr<LambdaExecutable>,post?:Attr<LambdaExecutable>}|Attr<LambdaExecutable>,post?:Attr<LambdaExecutable>):this{
        if(po instanceof Preparable || typeof po == "string"){
            this._.preHook=Attr.get(po,"Arn")
            if(post) this._.postHook=Attr.get(post,"Arn")
        }else{
            if(po.pre) this._.preHook=Attr.get(po.pre,"Arn")
            if(po.post) this._.postHook=Attr.get(po.post,"Arn")
        }
        return this
    }
    /**
     * **required:false**
     * @param role An IAM role ARN that CodeDeploy will use for traffic 
     * shifting. An IAM role will not be created if this is provided.
     * 
     * **maps:**`Role`
     */
    role(role:Attr<Role>){
        this._.role=Attr.get(role,"Arn")
        return this
    }
    /**
     * **required:false**
     * @param type There are two categories of deployment types at the moment: Linear and Canary. 
     * For more information about available deployment types see Deploying Serverless Applications
     * Gradually.
     * 
     * **maps:**`Type`
     */
    Type(type:Field<"Linear"|"Canary">){
        this._.type=type
        return this;
    }
    toJSON() {
        return {
            Alarms:notEmpty(this._.alarms),
            Enabled:this._.enabled,
            Hooks:this._.preHook || this._.postHook ? {
                PreTraffic:this._.preHook,
                PostTraffic:this._.postHook
            } : undefined,
            Role:this._.role,
            Type:this._.type
        }
    }    
    [checkValid](): SMap<ResourceError> {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.type){
            errors.push("must specify a type")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOn(this._,Preparable,o => o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        callOn(this._,Preparable,o => o[prepareQueue](stack,path,true))
    }
}
