import { Generatable, generateObject, prepareQueue, generationQueue } from "./general";
import { Module } from "./module";
import _ from "lodash";

export abstract class Provider extends Generatable{
    private prepared:boolean;
    //#region parameters
    private _alias:string
    private _version: string;
    //#endregion

    constructor(errorDepth:number){super(errorDepth+1);}

    //#region simple properties
    alias(alias:string):this{
        this._alias=alias;
        return this;
    }
    version(version:string):this{
        this._version=version;
        return this;
    }
    //#endregion

    //#region resource functions
    [prepareQueue](mod:Module,param:any){
        if(!this.prepared){
            this.prepared=true;
            _.defaults(mod[generationQueue].providers,{[this.resourceIdentifier]:[]})
                [this.resourceIdentifier].push(this);
            this.prepareQueue(mod,param);
        }
    }
    [generateObject](){
        const out=this.generateObject();
        return _.assign(out,{
            alias:this._alias,
            version:this._version,
        });
    }
    //#endregion
}