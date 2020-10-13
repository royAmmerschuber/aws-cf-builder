import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { Sub } from "aws-cf-builder-core/fields/substitution";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { PathDataCarrier, pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, prepareQueue, resourceIdentifier, stacktrace, toJson } from "aws-cf-builder-core/symbols";
import { callOnCheckValid, callOnPrepareQueue, notEmpty } from "aws-cf-builder-core/util";
export type StepOut=
    StepOut.S3Upload |
    StepOut.S3Download |
    StepOut.ExecuteBash |
    StepOut.ExecutePowerShell |
    StepOut.ExecuteBinary |
    StepOut.Reboot |
    StepOut.UpdateOS |
    StepOut.SetRegistry
export namespace StepOut{
    interface Base{
        name:Field<string>
        action:Field<string>
        inputs:any
        loop?:{
            name:Field<string>
            for:{
                start: Field<number>
                end: Field<number>
                updateBy: Field<number>
            }
        } | {
            name:Field<string>
            forEach:Field<string>[] | {
                list: Field<string>
                delimiter: Field<string>
            }
        }
        timeoutSeconds?:Field<number>
        onFailure?:Field<string>
        maxAttempts?:Field<number>
    }
    export interface S3Upload extends Base{
        action:"S3Upload"
        inputs:{
            source:Field<string>
            destination:Field<string>
            recurse?:Field<boolean>
        }[]
    }
    export interface S3Download extends Base{
        action:"S3Download"
        inputs:{
            source:Field<string>
            destination:Field<string>
        }[]
    }

    export interface ExecuteBash extends Base{
        action:"ExecuteBash"
        inputs:{
            commands:Field<string>[]
        }
    }
    export interface ExecutePowerShell extends Base{
        action:"ExecuteBash"
        inputs:{
            commands:Field<string>[]
        } | {
            file:Field<string>
        }
    }
    export interface ExecuteBinary extends Base{
        action:"ExecuteBinary",
        inputs:{
            path:Field<string>,
            arguments?:Field<string>[]
        }
    }
    export interface Reboot extends Base{
        action:"Reboot",
        inputs:{
            delaySeconds?:Field<number>
        }
    }
    export interface UpdateOS extends Base{
        action:"UpdateOS"
        inputs:{
            include?:Field<string>[]
            exclude?:Field<string>[]
        }
    }
    export interface SetRegistry extends Base{
        action:"SetRegistry"
        inputs:{
            path:Field<string>
            name:Field<string>
            value:Field<string|number>|Field<string|number>[]
            type:Field<string>
        }[]
    }
}
export type RegistryType=
    "BINARY" |
    "DWORD" |
    "QWORD" |
    "SZ" |
    "EXPAND_SZ" |
    "MULTI_SZ"
export type Step=
    Step.S3Upload | 
    Step.S3Download |
    Step.Execute |
    Step.Reboot |
    Step.UpdateOS |
    Step.SetRegistry
export namespace Step{
    abstract class BaseStep<Inp> extends InlineAdvField<StepOut>{
        protected _:{
            name:Field<string>
            action:Field<string>

            loopName:Field<string>
            loop:{
                start:Field<number>
                end:Field<number>
                step:Field<number>
            } | {
                items:Field<string>[]
            } | {
                string:Field<string>
                delimiter:Field<string>
            }
            onFailure:Field<string>
            maxAttempts:Field<number>
            timeout:Field<number>
        }
        loopName(name:Field<string>){
            this._.loopName=name
            return this
        }
        forEach(list:Field<string>[]):this
        forEach(list:Field<string>,delimiter:Field<string>):this
        forEach(list:Field<string>[]|Field<string>,delimiter?:Field<string>){
            if(list instanceof Array){
                this._.loop={
                    items:list
                }
            }else{
                this._.loop={
                    string:list,
                    delimiter
                }
            }
            return this
        }
        for(start:Field<number>,end:Field<number>,step:Field<number>=1){
            this._.loop={start,end,step}
            return this
        }
        name(name:Field<string>){
            this._.name=name
            return this
        }
        onFailure(action:Field<"Abort"|"Continue">){
            this._.onFailure=action
            return this
        }
        maxAttempts(num:Field<number>){
            this._.maxAttempts=num
            return this
        }
        timeout(sec:Field<number>){
            this._.timeout=sec
            return this
        }
        [toJson]() {
            return {
                action:this._.action,
                name:this._.name,
                input:this.genInput(),
                timeoutSeconds:this._.timeout,
                onFailure:this._.onFailure,
                maxAttempts:this._.maxAttempts,
                loop:this._.loop && {
                    name:this._.loopName,
                    for: "start" in this._.loop
                        ? {
                            start:this._.loop.start,
                            end:this._.loop.end,
                            updateBy:this._.loop.step
                        } 
                        : undefined ,
                    forEach: "delimiter" in this._.loop
                        ? {
                            list:this._.loop.string,
                            delimiter:this._.loop.delimiter
                        }
                        : "items" in this._.loop 
                            ? this._.loop.items
                            : undefined
                }
            }
        }
        protected abstract genInput():Inp;
        [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
            callOnPrepareQueue(this._,stack,path,true)
            if(!this._.name){
                if(path instanceof PathDataCarrier && path.data.index!==undefined){
                    this._.name=Sub`${this._.action}${path.data.index}`
                }else {
                    throw new PreparableError(this,"you must specify a name")
                }
            }
        }
        constructor(){
            super(2)
        }

    }
    export class S3Upload extends BaseStep<StepOut.S3Upload["inputs"]>{
        readonly [resourceIdentifier]="Step.S3Upload";
        protected _:BaseStep<any>["_"] & {
            transf:{
                from:Field<string>
                to:Field<string>
                rec?:Field<boolean>
            }[]
        }={
            action:"S3Upload",
            transf:[]
        } as any
        constructor()
        constructor(from:Field<string>,to:Field<string>,rec?:Field<boolean>)
        constructor(from?:Field<string>,to?:Field<string>,rec?:Field<boolean>){
            super()
            if(from){
                this.transfer(from,to,rec)
            }
        }
        transfer(from:Field<string>,to:Field<string>,rec?:Field<boolean>){
            this._.transf.push({ from,to,rec })
            return this
        }
        protected genInput() {
            return this._.transf.map(v=>({
                source:v.from,
                destination:v.to,
                recurse:v.rec
            }))
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            const errors:string[]=[]
            if(!this._.transf.length){
                errors.push("you must specify at least one transfer")
            }
            const out:SMap<ResourceError>={}
            if(errors.length){
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors
                }
            }
            return this[checkCache]=callOnCheckValid(this._,out)
        }

    }
    export class S3Download extends BaseStep<StepOut.S3Download["inputs"]>{
        readonly [resourceIdentifier]="Step.S3Download";
        protected _:BaseStep<any>["_"] & {
            transf:{
                from:Field<string>
                to:Field<string>
            }[]
        }={
            action:"S3Download",
            transf:[]
        } as any
        constructor()
        constructor(from:Field<string>,to:Field<string>)
        constructor(from?:Field<string>,to?:Field<string>){
            super()
            if(from){
                this.transfer(from,to)
            }
        }
        transfer(from:Field<string>,to:Field<string>){
            this._.transf.push({ from,to })
            return this
        }
        protected genInput() {
            return this._.transf.map(v=>({
                source:v.from,
                destination:v.to,
            }))
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            const errors:string[]=[]
            if(!this._.transf.length){
                errors.push("you must specify at least one transfer")
            }
            const out:SMap<ResourceError>={}
            if(errors.length){
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors
                }
            }
            return this[checkCache]=callOnCheckValid(this._,out)
        }

    }
    export class Execute extends BaseStep<(StepOut.ExecuteBash|StepOut.ExecutePowerShell|StepOut.ExecuteBinary)["inputs"]>{
        [resourceIdentifier]="Step.Execute";
        protected _:BaseStep<any>["_"] & {
            type:Field<"PowerShell"|"Bash">|"Binary"
            file:Field<string>
            args:Field<string>[]
            commands:Field<string>[]
        }={
            get action(){
                if(this.file && this.type=="Bash"){
                    return "ExecuteBinary"
                }
                return Sub`Execute${this.type}`
            }
        } as any
        constructor(type:"Binary",file:Field<string>,...args:Field<string>[])
        constructor(type:"PowerShell"|"Bash",file:Field<string>)
        constructor(type:Field<"PowerShell"|"Bash">,commands:Field<string>[])
        constructor(type:Field<"PowerShell"|"Bash">|"Binary",commands:Field<string>[]|Field<string>,...args:Field<string>[]){
            super()
            this._.type=type
            if(commands instanceof Array){
                this._.commands=commands
            }else{
                this._.file=commands
                this._.args=args
            }
        }
        protected genInput(): { commands: Field<string>[]; } | { file: Field<string>; } | { path: Field<string>; arguments?: Field<string>[]; } {
            if(this._.type=="Binary"){
                return {
                    path:this._.file,
                    arguments:notEmpty(this._.args)
                }
            }else if(this._.commands){
                return {
                    commands:this._.commands
                }
            }else if(this._.file){
                if(this._.type=="Bash"){
                    return {
                        path:"/bin/bash",
                        arguments:[
                            this._.file
                        ]
                    }
                }else{
                    return {
                        file:this._.file
                    }
                }
            }
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            return this[checkCache]=callOnCheckValid(this._,{})
        }

    }
    export class Reboot extends BaseStep<StepOut.Reboot["inputs"]>{
        readonly [resourceIdentifier]="Step.Reboot";
        protected _:BaseStep<any>["_"] & {
            delay:Field<number>
        }={
            action:"Reboot"
        } as any
        constructor(delayS?:Field<number>){
            super()
            this._.delay=delayS
        }
        protected genInput() {
            return {
                delaySeconds:this._.delay
            }
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            return this[checkCache]=callOnCheckValid(this._,{})
        }

    }
    export class UpdateOS extends BaseStep<StepOut.UpdateOS["inputs"]>{
        readonly [resourceIdentifier]="Step.UpdateOS";
        protected _:BaseStep<any>["_"] & {
            include:Field<string>[]
            exclude:Field<string>[]
        }={
            action:"UpdateOS",
            include:[],
            exclude:[]
        } as any
        constructor(){
            super()
        }
        include(...packages:Field<string>[]){
            this._.include.push(...packages)
            return this
        }
        exclude(...packages:Field<string>[]){
            this._.exclude.push(...packages)
            return this
        }
        protected genInput() {
            return {
                include:notEmpty(this._.include),
                exclude:notEmpty(this._.exclude)
            }
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            return this[checkCache]=callOnCheckValid(this._,{})
        }

    }
    export class SetRegistry extends BaseStep<StepOut.SetRegistry["inputs"]>{
        readonly [resourceIdentifier]="Step.SetRegistry";
        protected _:BaseStep<any>["_"] & {
            actions:{
                path:Field<string>,
                name:Field<string>,
                value:Field<string|number>|Field<string|number>[],
                type:Field<string>,
            }[]
        }={
            action:"SetRegistry",
            actions:[]
        } as any
        constructor()
        constructor(path:Field<string>,name:Field<string>,type:Field<RegistryType>,value:Field<string|number>|Field<string|number>[])
        constructor(path?:Field<string>,name?:Field<string>,type?:Field<RegistryType>,value?:Field<string|number>|Field<string|number>[]){
            super()
            if(path){
                this.set(path,name,type,value)
            }
        }
        set(path:Field<string>,name:Field<string>,type:Field<RegistryType>,value:Field<string|number>|Field<string|number>[]){
            this._.actions.push({ path,name,type,value })
            return this
        }
        protected genInput() {
            return this._.actions
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            const errors:string[]=[]
            if(!this._.actions.length){
                errors.push("you must specify at least one transfer")
            }
            const out:SMap<ResourceError>={}
            if(errors.length){
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors
                }
            }
            return this[checkCache]=callOnCheckValid(this._,out)
        }

    }
}
