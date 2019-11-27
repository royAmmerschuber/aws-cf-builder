
import _ from "lodash/fp";
import { URG } from "./urg";
import { resourceIdentifier, checkValid, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { Ref, Attr, prepareQueueBase, callOn } from "aws-cf-builder-core/util";
import { ResourceError, SMap, Preparable } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import { Policy } from "./policy";
import { Group } from "./group";
import { AccessKey } from "./accessKey";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";

export class User extends URG{
    readonly [resourceIdentifier]="AWS::IAM::User";
    //#region parameters
    protected _: URG["_"] & {
        password: Field<string>
        passwordReset: Field<boolean>
        groups:Field<string>[]
        permissionBoundary: Field<string>;
    }
    
    private keys: AccessKey[]=[];

    //#endregion
    /**
     * the UserName. For example: `mystack-myuser-1CCXAFG2H2U4D`.
     */
    r:ReferenceField
    a={
        /**
         * Returns the Amazon Resource Name (ARN) for the specified 
         * AWS::IAM::User resource. For example: 
         * `arn:aws:iam::123456789012:user/mystack-myuser-1CCXAFG2H2U4D`.
         */
        Arn:new AttributeField(this,"Arn")
    }
    
    constructor(){
        super(2);
        this._.groups=[]
    }
    /**
     * Creates a login profile so that the user can access the 
     * AWS Management Console.
     * 
     * **required:false**
     * @param password The password for the user.
     * 
     * **maps:**`LoginProfile.Password`
     * @param reset Specifies whether the user is required to set 
     * a new password the next time the user logs in to the AWS 
     * Management Console.
     * 
     * **maps:**`LoginProfile.PasswordResetRequired`
     */
    loginProfile(password:Field<string>,reset?:Field<boolean>){
        this._.password=password;
        this._.passwordReset=reset;
        return this
    }
    //#region sub resources
    /**
     * **required:false**
     * @param groups A name of a group to which you want to add 
     * the user.
     * 
     * **maps:**`Groups`
     */
    group(...groups:Ref<Group>[]):this{
        this._.groups.push(...groups.map(v =>Ref.get(v)));
        return this;
    }
    /**
     * **required:false**
     * @param policy The ARN of the policy that is used to set 
     * the permissions boundary for the user. Minimum length 
     * of 20. Maximum length of 2048.
     * 
     * **maps:**`PermissionsBoundary`
     */
    permissionsBoundary(policy:Attr<Policy.Managed>){
        this._.permissionBoundary=Attr.get<"Arn">(policy,"Arn")
        return this;
    }
    /**
     * **required:false**
     * @param key access keys to add to this user
     */
    key(...key:AccessKey[]):this{
        this.keys.push(...key);
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out=super[checkValid]();

        return this[checkCache]=this.keys.map(v =>v[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }
    [prepareQueue](stack: stackPreparable,path:pathItem,ref:boolean) {
        if(prepareQueueBase(stack,path,ref,this)){
            this.keys.forEach(o=>o[prepareQueue](stack,this,false))
            this.policiesR.forEach(o=>o[prepareQueue](stack,new PathDataCarrier(this,{policyAttachment:{type:"user",value:this.r}}),true))
            callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:_.defaults(super[generateObject]().Properties,{
                UserName:this._.name,
                LoginProfile:this._.password
                    ? {
                        Password:this._.password,
                        PasswordResetRequired:this._.passwordReset
                    }
                    : undefined,
                Groups:this._.groups.length
                    ? this._.groups
                    : undefined,
                PermissionBoundary:this._.permissionBoundary
            })
        }
    }
    //#endregion
}