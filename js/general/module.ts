import { Provider } from "./provider";
import { Resource } from "./resource";
import { DataSource } from "./dataSource";
import { generateObject, generationQueue, ResourceError, checkValid, prepareQueue, SMap } from "./general";
import _ from "lodash"
import chalk from "chalk"
export class Module{
    public [generationQueue]={
        providers:<SMap<Provider[]>>{},
        resources:<SMap<SMap<Resource>>>{},
        dataSources:<SMap<SMap<DataSource>>>{},
        modules:<SMap<Module>>{}
    }
    private _providers:Provider[]=[];
    private _resources:(Resource|DataSource)[]=[];
    private _modules: Module[]=[];
    constructor(
        private name="main"
    ){}
    providers(...providers:Provider[]){
        this._providers.push(...providers)
        return this;
    }
    resources(...resources:(Resource|DataSource)[]){
        this._resources.push(...resources);
        return this;
    }
    modules(...modules:Module[]){
        this._modules.push(...modules);
        return this;
    }
    generate():any{
        this.check();
        this.prepareQueue();
        return this.generateObject();
    }

    private check(){
        const errors:SMap<ResourceError>={}
        _.assign(errors,
            ...this._modules.map(v => v[checkValid]()),
            ...this._providers.map(v => v[checkValid]()),
            ...this._resources.map(v => v[checkValid]()),
        )
        if(_.size(errors)){
            let out=""
            _.forOwn(errors,(v,k)=>{
                out+=chalk.yellow(v.type)+"\n";
                out+=k+"\n";
                v.errors.forEach(v => out+="    "+v+"\n");
            })
            throw new Error(out);
        }
    }
    private prepareQueue(){
        this._modules.forEach(v => v[prepareQueue](this,{}));
        this._providers.forEach(v => v[prepareQueue](this,{}));
        this._resources.forEach(v => v[prepareQueue](this,{}));
    }
    private generateObject(){
        return {
            provider:_.mapValues(this[generationQueue].providers,v => {
                if(v.length==1){
                    return v[0][generateObject]()
                    
                }
                return v.map(v => v[generateObject]())
            }),
            resource:_.mapValues(this[generationQueue].resources,
                v => _.mapValues(v,v => v[generateObject]())
            ),
            datasource:_.mapValues(this[generationQueue].dataSources,
                v => _.mapValues(v,v => v[generateObject]())
            )
        }
    }
}

