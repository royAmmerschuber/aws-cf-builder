import { Resource } from "aws-cf-builder-core/generatables/resource";
import { namedPath, pathItem, PathDataCarrier } from "aws-cf-builder-core/path";
import { resourceIdentifier, checkValid, checkCache, prepareQueue, stacktrace, generateObject, pathName, s_path } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { callOn, findInPath } from "aws-cf-builder-core/util";
import { SMap, ResourceError, Preparable, PreparableError } from "aws-cf-builder-core/general";
import _ from "lodash/fp"
import { LambdaFunction } from "./function";
import { Version } from "./version";
import { EventMapping } from "./eventMapping";
import { refPlaceholder } from "aws-cf-builder-core/refPlaceholder";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
/**
 * The AWS::Lambda::Alias resource creates an alias that points to the 
 * version of an AWS Lambda (Lambda) function that you specify. Use 
 * aliases when you want to control which version of your function 
 * other services or applications invoke. Those services or 
 * applications can use your function's alias so that they don't need 
 * to be updated whenever you release a new version of your function. 
 * For more information, see Introduction to AWS Lambda Aliases in 
 * the AWS Lambda Developer Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-alias.html)
 */
export class Alias extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::Lambda::Alias";
    //#region parameters
    private _:{
        name:Field<string>
        description: Field<string>

        functionName:Field<string>
    }={} as any
    private versions:{version:Field<string>,weight:Field<number>}[]=[]
    private eventMappings:EventMapping[]=[];

    /**
     * the resource ARN.
     */
    r:ReferenceField
    a={
        Arn:this.r
    }
    //#endregion
    constructor(){ super(1) }

    //#region simple parameters
    /**
     * **required:true**
     * 
     * **maps:** `Name`
     * @param name A name for the alias.
     */
    Name(name:Field<string>){
        this._.name=name
        return this;
    }
    /**
     * **required:false**
     * @param descr Information about the alias, such as its purpose or 
     * the Lambda function that is associated with it.
     * 
     * **maps:** `Description`
     */
    description(descr:Field<string>){
        this._.description=descr;
        return this;
    }
    //#endregion
    
    //#region subresources
    /**
     * **required:false**
     * @param mapping the event mappings to add to this resource
     */
    eventMapping(...mapping:EventMapping[]){
        this.eventMappings.push(...mapping);
        return this;
    }
    //#endregion

    //#region resource functions
    [checkValid]() {
        if(this[checkCache])return this[checkCache]
        const out:SMap<ResourceError>={}
        const errs:string[]=[]
        if(!this._.name){
            errs.push("you must specify the Name")
        }
        if(errs.length){
            out[this[stacktrace]]={
                errors:errs,
                type:this[resourceIdentifier]
            }
        }
        return this[checkCache]=callOn(this._,Preparable as any,(o:Preparable)=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }

    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        //TODO antipattern
        if(ref){
            stack.resources.add(new refPlaceholder(this,path))
        }else{
            if(this[s_path]===undefined){
                this[s_path]=path
                stack.resources.add(this)
                
                callOn(this._,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,true))
                callOn(this.eventMappings,Preparable as any,(o:Preparable)=>o[prepareQueue](stack,this,false))

                const { func } =findInPath(path,{func:LambdaFunction})
                

                if(!func) throw new PreparableError(this,"Lambda Function not found in path")
                this._.functionName=func.obj.r
            }
            if(path instanceof PathDataCarrier && "versionWeight" in path.data){
                const {ver} =findInPath(path,{ver:Version})
                this.versions.push({
                    version:ver.obj.a.Version,
                    weight:path.data.versionWeight
                })
            }
        }
    }

    [generateObject]() {
        if(!this.versions.length) 
            throw new PreparableError(this,"no versions found")
        const nV=this.versions.filter(v=>v.weight===null)
        if(nV.length!=1)
            throw new PreparableError(this,"exactly one of the versions associated with an alias must not have a weight set")
        
        return{
            Type:this[resourceIdentifier],
            Properties:{
                Name:this._.name,
                Description:this._.description,
                FunctionName:this._.functionName,
                FunctionVersion:nV[0].version,
                RoutingConfig:this.versions.length>1 ? {
                    AdditionalVersionWeights:this.versions.filter(v => v.weight!==null).map(v => ({
                        FunctionVersion:v.version,
                        FunctionWeight:v.weight
                    }))
                } : undefined
            }
        }
    }
    [pathName](){
        if(this._.name instanceof Preparable) return ""
        return this._.name
    }
    //#endregion
}