import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, stacktrace, checkCache, prepareQueue, generateObject, pathName } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { prepareQueueBase, findInPath, callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
import _ from "lodash/fp"
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Layer } from "./layer";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
/**
 * The AWS::Lambda::LayerVersionPermission resource gives other 
 * accounts permission to use a layer version in AWS Lambda. 
 * For more information, see AWS Lambda Layers in the AWS 
 * Lambda Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-layerversionpermission.html)
 */
export class LayerPermission extends Resource{
    readonly [resourceIdentifier]="AWS::Lambda::LayerPermission";
    private _:{
        action: Field<string>
        principal: Field<string>
        organizationId: Field<string>
        layerVersionArn: Field<string>
    }={} as any
    /**
     * the layer version ARN and statement ID, such as `arn:aws:lambda:us-west-2:123456789012:layer:my-layer:1#engineering-org`.
     */
    r:ReferenceField
    /**
     * @param name only used for logical id
     * **default:** `"main"`
     */
    constructor(
        private name:string="main"
    ){super(1);}
    
    /**
     * **required:true**
     * @param action The API action that grants access to the layer. 
     * For example, lambda:GetLayerVersion.
     * 
     * **maps:** `Action`
     */
    Action(action:Field<string>){
        this._.action=action;
        return this;
    }
    /**
     * **required:true**
     * @param principal An account ID, or * to grant permission to 
     * all AWS accounts.
     * 
     * **maps:** `Principal`
     */
    Principal(principal:Field<string>){
        this._.principal=principal;
        return this;
    }
    /**
     * **required:false**
     * @param id With the principal set to *, grant permission to 
     * all accounts in the specified organization.
     */
    organizationId(id:Field<string>){
        this._.organizationId=id;
        return this;
    }

    [checkValid]() {
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[]
        if(!this._.action){
            errors.push("you must specify an Action");
        }
        if(!this._.principal){
            errors.push("you must specify a Principal");
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOnCheckValid(this._,out)
    }
    [prepareQueue](stack: stackPreparable, path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this._,stack,this,true)

            const { layer }=findInPath(path,{layer:Layer})

            if(!layer) throw new PreparableError(this,"layer not found in path")
            this._.layerVersionArn=layer.obj.a.Arn
        }
    }
    [generateObject]() {
        return {
            Type:this[resourceIdentifier],
            Properties:{
                LayerVersionArn:this._.layerVersionArn,
                Action:this._.action,
                Principal:this._.principal,
                OrganizationId:this._.organizationId
            }
        }
    }
    [pathName](){
        return this.name
    }
}