import { Generatable, SMap, ResourceError, generationQueue, callFieldReferences, checkValid, prepareQueue } from "./general";
import { Module } from "./module";
import { AdvField, Field } from "./field";
import _ from "lodash";

export type TypeOfName<T extends string>=
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "bool" ? boolean :any
;

export class Variable<T extends string> extends AdvField<TypeOfName<T>>{
    
    protected resourceIdentifier="Variable";
    private _type:string
    private _name:string
    private _description: string;
    private _default: TypeOfName<T>;
    constructor(name:string,type?:T){
        super(1)
        this._name=name;
        this._type=type;
    }
    default(v:TypeOfName<T>){
        this._default=v;
        return this;
    }
    description(text:string):this{
        this._description=text;
        return this;
    }

    protected checkValid(): SMap<ResourceError> {
        return {};
    }
    protected prepareQueue(mod: Module, param: any) {
        mod[generationQueue].variables[this._name]=this
    }
    protected generateObject() {
        return {
            type:this._type,
            default:this._default,
            description:this._description
        }
    }
    protected generateField(): string {
        return "${var."+this._name+"}";
    }
    protected getName(par: SMap<any>): string {
        return this._name;
    }
}
export class Output<T> extends Generatable{
    protected resourceIdentifier="Output";
    private _name:string;
    private _value: Field<T>;
    private _sensitive: Field<boolean>;
    private _description: Field<string>;
    private _dependsOn: Field<any>[]=[];
    constructor(name:string,value:Field<T>){
        super(1);
        this._name=name;
        this._value=value;
    }
    description(text:Field<string>){
        this._description=text;
        return this;
    }
    sensitive(bool:Field<boolean>=true){
        this._sensitive=bool;
        return this;
    }
    dependsOn(...fields:Field<any>[]){
        this._dependsOn.push(...fields)
        return this;
    }
    protected checkValid(): SMap<ResourceError> {
        return _.assign({},
            ..._(this)
                .filter((_v,k) => k.startsWith("_"))
                .flatMap(v => callFieldReferences(v[1],v => v[checkValid]()))
                .value()
        )
    }
    protected prepareQueue(mod: Module, param: any) {
        mod[generationQueue].outputs[this._name]=this;
        _(this)
            .filter((_v,k) => k.startsWith("_"))
            .forEach(v => callFieldReferences(v[1],v => v[prepareQueue](mod,param)))
    }
    protected generateObject() {
        return {
            value:this._value,
            sensitive:this._sensitive,
            description:this._description,
            dependsOn:this._dependsOn.length ? this._dependsOn : undefined
        }
    }
}
export class Local<T> extends AdvField<T>{
    protected generateField(): string {
        return "${local."+this._name+"}"
    }
    protected getName(par: SMap<any>): string {
        return this._name
    }
    protected resourceIdentifier="Local";
    private _name:string;
    private _value: Field<T>;
    constructor(name:string,value:Field<T>){
        super(1);
        this._name=name;
        this._value=value;
    }
    protected checkValid(): SMap<ResourceError> {
        return _.assign({},...callFieldReferences(this._value,v => v[checkValid]()))
    }
    protected prepareQueue(mod: Module, param: any) {
        mod[generationQueue].locals[this._name]=this;
        callFieldReferences(this._value,v => v[prepareQueue](mod,param))
    }
    protected generateObject() {
        return this._value
    }


}