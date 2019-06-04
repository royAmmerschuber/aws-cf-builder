import { Resource } from "./resource";
import { getName, prepareQueue, SMap, getRef, ResourceError, checkValid, Generatable } from "./general";
import { Module } from "./module";
import { DataSource } from "./dataSource";

export type Field<T>=T|AdvField<T>
export type Ref<T,ref>=Field<T>|ref
export abstract class AdvField<T> extends Generatable{
    toJSON(){
        return this.generateField()
    }
    [prepareQueue](mod:Module,par:SMap<any>){
        
        this.prepareQueue(mod,par)
    }
    [checkValid](){return this.checkValid()}
    [getName](par:SMap<any>){return this.getName(par)}
    protected abstract checkValid():SMap<ResourceError>
    protected abstract prepareQueue(mod:Module,par:SMap<any>)
    protected abstract generateField():T|string
    protected abstract getName(par:SMap<any>):string
    protected generateObject():any{
        return {}
    }
}
type referenceMerger<T>=ReferenceField<T> & (
    T extends object ?
    {[k in keyof T]:referenceMerger<T[k]>} :
    {}
)
export class ReferenceField<T> extends AdvField<T>{
    protected readonly resourceIdentifier="Ref"
    public static create<T>(resource:Resource|DataSource,attr:string):referenceMerger<T>{
        if(attr==""){
            return new ReferenceField(resource,attr) as any
        }else if(!isNaN(Number(attr))){
            return new ReferenceField(resource,"["+attr+"]") as any
        }else{
            return new ReferenceField(resource,"."+attr) as any
        }
    }
    private constructor(private resource:Resource|DataSource,private attr:string){
        super(1)
        return new Proxy(this,{
            get(t,p){
                if((p in t) || typeof p=="symbol"){
                    return t[p]
                }else if(isNaN(Number(p))){
                    return new ReferenceField(resource,attr+"."+p)
                }else{
                    return new ReferenceField(resource,attr+"["+p+"]")
                }
            }
        })
    }

    protected generateField(){
        if(this.resource instanceof Resource){
            return "${"+this.resource[getRef]({})+this.attr+"}"
        }else{
            return "${data."+this.resource[getRef]({})+this.attr+"}"
        }
    }
    protected prepareQueue(mod: Module,par: SMap<any>){
        this.resource[prepareQueue](mod,par);
    }
    protected checkValid(){
        return this.resource[checkValid]();
    }
    protected getName(par){
        return this.resource[getName](par)
    }

}

export function fieldToId(f:Field<any>):string{
    if(f instanceof AdvField){
        const x=f[getName]({})
        return x
    }else{
        return f
    }
}
