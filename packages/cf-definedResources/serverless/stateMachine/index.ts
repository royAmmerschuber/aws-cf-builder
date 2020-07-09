import { Resource } from "aws-cf-builder-core/generatables/resource";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { generateObject, resourceIdentifier, checkValid, prepareQueue } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
import { Field } from "aws-cf-builder-core/field";
import { PolicyOut } from "../../iam/policy/policyDocument";
import { PolicyTemplateOut } from "../policyTemplate";
import { Policy, ManagedPolicy, Role } from "../../iam";
import { Attr } from "aws-cf-builder-core/util";
import _ from "lodash/fp";
import { SMDefinitionOut } from "../../stepFunctions/stateMachine/definition";

export type StateMachineType="STANDARD"|"EXPRESS"
export class StateMachine extends Resource{
    readonly [resourceIdentifier]="AWS::Serverless::StateMachine"
    private _:{
        name:Field<string>
        policies:Field<string|PolicyOut|PolicyTemplateOut>[]
        role:Field<string>
        tags:SMap<Field<string>>
        type:Field<string>

        logGroupArns:Field<string>[]
        logExecutionData:Field<boolean>
        logLevel:Field<string>
    }={
        policies:[],
        logDestinations:[]
    } as any
    constructor(){
        super(1)
    }

    name(name:Field<string>){
        this._.name=name
        return this
    }

    policies(...policies:(Attr<ManagedPolicy>|Field<string|PolicyOut/*TODO |PolicyTemplateOut */>|Policy.Document)[]){
        this._.policies.push(...policies.map(p => p instanceof Resource ? Attr.get(p,"Arn") : p))
        return this
    }

    role(role:Attr<Role>){
        this._.role=Attr.get(role,"Arn")
        return this
    }

    /**
     * An arbitrary set of tags (key–value pairs) for this State Machine.
     * 
     * **required:false**
     * 
     * **maps:** `Tags`
     * @param tags a map of tags
     */
    tag(tags:SMap<Field<string>>):this;
    /**
     * @param key the key of a new tag
     * @param value the value for the tag
     */
    tag(key:string,value:Field<string>):this;
    tag(tk:string|SMap<Field<string>>,value?:Field<string>):this{
        if(value!=undefined){
            this._.tags[tk as string]=value
        }else{
            this._.tags=_.assign(this._.tags,tk)
        }
        return this
    }

    type(type:Field<StateMachineType>){
        this._.type=type
        return this
    }

    logDestinations(...logGroupArns:Attr<"Arn">[]){
        this._.logGroupArns.push(...logGroupArns.map(v=>Attr.get(v,"Arn")))
        return this
    }
    logLevel(level:Field<string>){
        this._.logLevel=level
        return this
    }
    logExecutionData(bool:Field<boolean>=true){
        this._.logExecutionData=bool
        return this
    }
    
    Definition(definition:Field<SMDefinitionOut>)
    Definition(path:Field<string>,subs?:SMap<Field<string>>)
    Definition(){

    }
    [generateObject]() {
        throw new Error("Method not implemented.");
    }
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        throw new Error("Method not implemented.");
    }

}