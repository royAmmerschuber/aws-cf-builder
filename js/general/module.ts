import { Provider } from "./provider";
import { Resource } from "./resource";
import { DataSource } from "./dataSource";
import { generateObject, generationQueue, ResourceError, checkValid, prepareQueue, SMap, Generatable } from "./general";
import _ from "lodash"
import chalk from "chalk"
import { Variable, Output, Local } from "./variable";
export class Module{
    public [generationQueue]={
        providers:<SMap<Provider[]>>{},
        resources:<SMap<SMap<Resource>>>{},
        dataSources:<SMap<SMap<DataSource>>>{},
        variables:<SMap<Variable<any>>>{},
        outputs:<SMap<Output<any>>>{},
        locals:<SMap<Local<any>>>{}
    }
    private _providers:Provider[]=[];
    private _resources:(Resource|DataSource)[]=[];
    private _outputs:Output<any>[]=[]
    constructor(
        private name="main"
    ){}
    providers(...providers:Provider[]){
        this._providers.push(...providers)
        return this;
    }
    outputs(...outputs:Output<any>[]){
        this._outputs.push(...outputs)
        return this;
    }
    resources(...resources:(SMap<Resource|DataSource>|(Resource|DataSource)[]|Resource|DataSource)[]){
        resources.forEach(v => {
            if(v instanceof Resource || v instanceof DataSource){
                this._resources.push(v)
            }else if(v instanceof Array){
                this.resources(...v)
            }else{
                this.resources(..._.values(v))
            }
        })
        return this;
    }
    generate():any{
        this.check();
        this.prepareQueue();
        return this.generateObject();
    }

    private check(){
        const errors:SMap<ResourceError>={}
        _.assign(errors, ..._.flatMap(<Generatable[][]>[
            this._providers,
            this._resources,
            this._outputs
        ], v => v.map(v =>v[checkValid]())))
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
        [
            this._providers,
            this._resources,
            this._outputs   
        ].forEach(v => v.forEach(v => v[prepareQueue](this,{})))
    }
    private generateObject(){
        const gq=this[generationQueue]
        return {
            variable:_.size(gq.variables) ? _.mapValues(gq.variables, (v,k) =>v[generateObject](k)) : undefined,
            locals:_.size(gq.locals) ? _.mapValues(gq.locals, (v,k) => v[generateObject](k)) : undefined,
            provider:_.size(gq.providers) ? _.mapValues(gq.providers,v => {
                if(v.length==1){
                    return v[0][generateObject]()
                    
                }
                return v.map(v => v[generateObject]())
            }) : undefined,
            datasource:_.size(gq.dataSources) ? _.mapValues(gq.dataSources,
                v => _.mapValues(v,(v,k) => v[generateObject](k))
            ) : undefined,
            resource:_.size(gq.resources) ? _.mapValues(gq.resources,
                v => _.mapValues(v,(v,k) => v[generateObject](k))
            ) : undefined,
            output:_.size(gq.outputs) ? _.mapValues(gq.outputs, (v,k) => v[generateObject](k)) : undefined,
        }
    }
}