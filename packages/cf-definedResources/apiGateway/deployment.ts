import { Api } from "./api";
import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, prepareQueue, checkCache, pathName, toJson } from "aws-cf-builder-core/symbols";
import { checkValid } from "aws-cf-builder-core/symbols";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { Preparable, ResourceError, SMap, PreparableError } from "aws-cf-builder-core/general";
import { callOn, prepareQueueBase, findInPath } from "aws-cf-builder-core/util";
import { generateObject } from "aws-cf-builder-core/symbols";
import { PathDataCarrier, pathItem } from "aws-cf-builder-core/path";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { namedPath } from "aws-cf-builder-core/path";
import { Tag } from "../util";
/**
 * The AWS::ApiGateway::Deployment resource deploys an Amazon API Gateway (API Gateway) 
 * RestApi resource to a stage so that clients can call the API over the Internet. The 
 * stage acts as an environment.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-deployment.html)
 */
export class Deployment extends Resource implements namedPath{
    readonly [resourceIdentifier]="AWS::ApiGateway::Deployment";

    //#region parameters
    private _:{
        canarySettings:CanarySetting;
        stageDescription:StageDescription;
        description:Field<string>;

        restApiId:Field<string>
    }={} as any
    private methods:ReferenceField[]
    private _autoDeploy: boolean;
    //#endregion
    /**
     * the deployment ID, such as `123abc`
     */
    r:ReferenceField
    /**
     * @param name A name for the stage that API Gateway creates with this deployment. 
     * Use only alphanumeric characters. used to generate logicalId
     * 
     * **maps:** `StageName`
     * @param useName if the name should be used or just be used for the id
     */
    constructor(
        private name:Field<string>,
        private useName:boolean=false
    ){super(2);}
    //#region simple property setters
    
    /**
     * **maps:** `DeploymentCanarySettings`
     * 
     * **required:false**
     * @param settings Specifies settings for the canary deployment.
     */
    public canarySettings(settings:CanarySetting):this{
        this._.canarySettings=settings;
        return this;
    }
    /**
     * **maps:** `StageDescription`
     * 
     * **required:false**
     * @param desc Configures the stage that API Gateway creates with this deployment.
     */
    public stageDescription(desc:StageDescription):this{
        this._.stageDescription=desc;
        return this;
    }
    /**
     * **maps:** `Description`
     * 
     * **required: false**
     * @param desc A description of the purpose of the API Gateway deployment.
     */
    public description(desc:Field<string>):this{
        this._.description=desc;
        return this;
    }
    /**
     * when enabled tries to make sure that it redeploys the api.
     * 
     * this only works if you regenerate the cloudformation every time
     * @returns 
     */
    public autoDeploy(bool:boolean=true):this{
        this._autoDeploy=bool
        return this
    }
    //#endregion

    //#region resource functions
    public [checkValid]() {
        if(this[checkCache]) return this[checkCache]
        return this[checkCache]=callOn([this._,this.name],Preparable,o=>o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,{})
    }

    public [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean): void {
        if(prepareQueueBase(stack,path,ref,this)){
            callOn([this._, this.name],Preparable,o=>{
                o[prepareQueue](stack,this,true)
            })

            if(!(path instanceof PathDataCarrier && path.data.methods instanceof Array)){
                throw new PreparableError(this,"data not found")
            }
            this.methods=path.data.methods
            const { api }=findInPath(path,{api:Api})
            if(!api){
                throw( new PreparableError(this,"api not found in path"))
            }
            this._.restApiId=api.obj.r
        }
    }

    public [generateObject](){
        return {
            Type:this[resourceIdentifier],
            DependsOn:this.methods.map(v=>v[toJson]().Ref),
            Properties:{
                StageDescription : this._.stageDescription,
                DeploymentCanarySettings :this._.canarySettings,
                Description : this._.description,
                StageName : this.useName ? this.name : undefined,
                RestApiId : this._.restApiId
            }
        }
    }
    
    [pathName](){
        const hash=this._autoDeploy 
            ? new Date() as any-0
            : ""
        if(this.name instanceof Preparable){
            return ""+hash
        }else{
            return _.capitalize(this.name)+hash
        }
    }
    //#endregion
}

/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-deployment-stagedescription.html)
 */
export interface StageDescription{ //TODO possibly inline into Deployment
    AccessLogSetting?:{
        DestinationArn?:Field<string>,
        Format?:Field<string>
    },
    CacheClusterEnabled?:Field<boolean>,
    CacheClusterSize?:Field<string>,
    CacheDataEncrypted?:Field<boolean>,
    CacheTtlInSeconds?:Field<number>,
    CachingEnabled?:Field<boolean>,
    CanarySetting?:Field<CanarySetting>,
    ClientCertificateId?:Field<string>,
    DataTraceEnabled?:Field<boolean>,
    Description?:Field<string>,
    DocumentationVersion?:Field<string>,
    LoggingLevel?:Field<string>,
    MethodSettings?:MethodSetting[],
    MetricsEnabled?:Field<boolean>,
    ThrottlingBurstLimit?:Field<number>,
    ThrottlingRateLimit?:Field<number>,
    Variables?:SMap<Field<string>>,
    Tags?:Tag[]
}

/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-deployment-canarysetting.html)
 */
export interface CanarySetting{ //TODO
    PercentTraffic?:Field<number>;
    StageVariableOverrides?:SMap<Field<string>>;
    UseStageCache?:Field<boolean>;
}

/**
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-deployment-stagedescription-methodsetting.html)
 */
export interface MethodSetting{ //TODO
    CacheDataEncrypted?:Field<boolean>,
    CacheTtlInSeconds?:Field<number>,
    CachingEnabled?:Field<boolean>,
    DataTraceEnabled?:Field<boolean>,
    HttpMethod?:Field<string>,
    LoggingLevel?:Field<string>,
    MetricsEnabled?:Field<boolean>,
    ResourcePath?:Field<string>,
    ThrottlingBurstLimit?:Field<number>,
    ThrottlingRateLimit?:Field<number>
}