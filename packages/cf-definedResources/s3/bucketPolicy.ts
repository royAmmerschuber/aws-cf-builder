import { Resource } from "aws-cf-builder-core/generatables/resource";
import { resourceIdentifier, checkValid, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { callOnCheckValid, prepareQueueBase, callOnPrepareQueue, findInPath } from "aws-cf-builder-core/util";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { Bucket } from "./bucket";
import { PreparableError } from "aws-cf-builder-core/general";
import { Policy } from "../iam";
import { PolicyOut } from "../iam/policy/policyDocument";


export class BucketPolicy extends Resource{
    readonly [resourceIdentifier]="AWS::S3::BucketPolicy"
    private bucket:Field<string>
    constructor(private policy:Field<PolicyOut>|Policy.Document){
        super(2)
    }
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        return callOnCheckValid(this.policy,{})
    }

    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(stack,path,ref,this)){
            callOnPrepareQueue(this.policy,stack,path,true)

            const {bucket} =findInPath(path,{bucket:Bucket})
            if(!bucket){
                throw new PreparableError(this,"bucket not found in path")
            }
            this.bucket=bucket.obj.r
        }
    }

    [generateObject](){
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Bucket:this.bucket,
                PolicyDocument:this.policy
            }
        }
    }

}