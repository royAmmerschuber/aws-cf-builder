
import { Api } from "./api";
import _ from "lodash/fp";
import { resourceIdentifier, generateObject, pathName } from "aws-cf-builder-core/symbols";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Field, isAdvField } from "aws-cf-builder-core/field";
import { checkValid, prepareQueue } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { PreparableError } from "aws-cf-builder-core/general";
import { prepareQueueBase, findInPath } from "aws-cf-builder-core/util";
import { pathItem, namedPath } from "aws-cf-builder-core/path";

/**
 * The AWS::ApiGateway::Resource resource creates a resource in an Amazon API Gateway (API Gateway) API.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html)
 * 
 * you probably dont need to create these yourself because they are automaticly inserted into the tree of an Api
 */
export class ApiResource extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::ApiGateway::Resource";
    private parentId:Field<string>
    private restApiId:Field<string>
    constructor(private pathpart:Field<string>){
        super(2);
    }

    public [checkValid]() {
        if(isAdvField(this.pathpart)){
            return this.pathpart[checkValid]()
        }
    }

    public [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean):void{
        if(prepareQueueBase(stack,path,ref,this)){
            //prepare subs
            if(isAdvField(this.pathpart)){
                this.pathpart[prepareQueue](stack,this,true)
            }
            //load parent data
            const {api, res}=findInPath(path,{
                res:ApiResource,
                api:Api
            })
            if(!api){
                throw new PreparableError(this,"api not found in path of resource")
            }
            this.restApiId=api.obj.r
            if(!res || api.depth>res.depth){
                this.parentId=api.obj.a.RootResourceId
            }else{
                this.parentId=res.obj.r
            }
        }
    }
    
    public [generateObject]() {
        return{
            Type:this[resourceIdentifier],
            Properties:{
                PathPart:this.pathpart,
                ParentId: this.parentId,
                RestApiId:this.restApiId
            }
        };
    }
    public [pathName](){
        if(typeof this.pathpart=="string"){
            if(this.pathpart.startsWith("{")){
                return "PAR"
            }
            return _.capitalize(this.pathpart)
        }
        return ""
    }
}