
import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Field, isAdvField } from "aws-cf-builder-core/field";
import { checkValid, checkCache, generateObject } from "aws-cf-builder-core/symbols";
import { PolicyOut, PolicyDocument } from "./policy/policyDocument";
import { SMap, PreparableError, Preparable } from "aws-cf-builder-core/general";
import { Attr, callOn, notEmpty } from "aws-cf-builder-core/util";

export abstract class URG extends Resource {
    //#region properties
    protected _:{
        name:Field<string>
        path:Field<string>
        managedPolicies:Field<string>[]
        policies:{policy:Field<PolicyOut>,name:Field<string>}[]
    }={
        managedPolicies:[],
        policies:[]
    } as any

    protected policiesR:Policy[]=[];

    //#endregion
    constructor(errorDepth){
        super(errorDepth+1);
    }

    name(pathName:string):this
    name(name:Field<string>):this
    name(path:Field<string>,name:Field<string>):this
    name(pathName:Field<string>,name?:Field<string>){
        if(name==undefined){
            if(typeof pathName=="string"){
                const split=pathName.lastIndexOf("/")
                this._.path=pathName.slice(0,split+1) || undefined
                this._.name=pathName.slice(split+1)
            }else{
                this._.name=pathName
            }
        }else{
            this._.path=pathName
            this._.name=name
        }
        return this
    }
    //#region subResources & references
    /**
     * **required:false**
     * @param policies a list of policy resources that should 
     * be attached to this Resource
     */
    policy(...policies:Policy[]):this;
    /**
     * The policies to associate with this resource. For 
     * sample templates, see Template Examples.
     *  
     * > **Important**
     * > 
     * > The name of each policy for a role, user, or group must be unique. 
     * > If you don't, updates to the IAM role will fail.
     *
     * > **Note**
     * > 
     * > If an external policy (such as AWS::IAM::Policy or 
     * > AWS::IAM::ManagedPolicy) has a Ref to a resource and if a resource (such 
     * > as AWS::ECS::Service) also has a Ref to the same resource, add a DependsOn 
     * > attribute to the resource to make the resource depend on the external 
     * > policy. This dependency ensures that the resource's policy is available 
     * > throughout the resource's lifecycle. For example, when you delete a 
     * > stack with an AWS::ECS::Service resource, the DependsOn attribute 
     * > ensures that AWS CloudFormation deletes the AWS::ECS::Service resource 
     * > before deleting its resource's policy.
     * 
     * **required:false**
     * 
     * **maps:** `Policies`
     * @param docs a map of policy documents
     */
    policy(docs:SMap<Field<PolicyOut>|PolicyDocument>):this;
    /**
     * @param name the name of the document
     * @param policy the Document
     */
    policy(name:Field<string>,policy:Field<PolicyOut>|PolicyDocument):this;
    policy(dn:SMap<Field<PolicyOut>>|Field<string>|Policy,policy?:Field<PolicyOut>|Policy,...policies:Policy[]):this{
        if(typeof dn=="string" || isAdvField(dn)){
            if(policy instanceof Policy) throw new PreparableError(this,"policy must be a PolicyDocument not a Policy")
            this._.policies.push({
                name:dn,
                policy:policy
            })
        }else{
            if(dn instanceof Policy){
                this.policiesR.push(dn)
                if(policy instanceof Policy) this.policiesR.push(policy)
                this.policiesR.push(...policies)
            }else{
                this._.policies.push(..._.flow(
                    _.toPairs,
                    _.map(([n,p]:[string,Field<PolicyOut>])=>({
                        name:n,
                        policy:p
                    }))
                )(dn))
            }
        }
        return this;
    }
    /**
     * **required:false**
     * 
     * **maps:** `ManagedPolicyArns`
     * @param arns One or more managed policy ARNs to attach to this 
     * resource.
     */
    managedPolicies(...arns:Attr<Policy.Managed>[]){
        this._.managedPolicies.push(...arns.map(a=>Attr.get(a,"Arn")));
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid](){
        if(this[checkCache])return this[checkCache]
        return this[checkCache]=callOn([
            this._,
            this.policiesR
        ],Preparable,o=>o[checkValid]())
            .reduce(_.assign,{})
    }
    [generateObject]():any{
        return {
            Properties:{
                ManagedPolicyArns:notEmpty(this._.managedPolicies),
                Policies:this._.policies.length 
                    ? this._.policies.map(v => ({
                        PolicyDocument:v.policy,
                        PolicyName:v.name
                    })) 
                    : undefined,
                Path:this._.path
            }
        }
    }
    //#endregion
}
import { Policy } from "./policy";