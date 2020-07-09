import { InlineAdvField } from "aws-cf-builder-core/field";
import { SMap, ResourceError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { resourceIdentifier, checkValid, prepareQueue } from "aws-cf-builder-core/symbols";
import { pathItem } from "aws-cf-builder-core/path";
JSONPath<{test:{paul:number}}>().test.paul
export function JSONPath<T=any>():JSONPath<T>{
    return new _JSONPath() as any
}
export type JSONPath<T>=_JSONPath & ( T extends string|number|Function ? {} :{
    [k in keyof T]:JSONPath<T[k]>
} )
export class _JSONPath extends InlineAdvField<string>{
    [resourceIdentifier]="JSONPath"
    private parent:_JSONPath
    private segment:number|string
    private handler:ProxyHandler<this>={
        get(target,p){
            if(typeof p=="symbol"){
                return target[p].bind(target)
            }else{
                return new _JSONPath(target,p)
            }
        }
    }
    constructor(parent?:_JSONPath,segment?:number|string){
        super(1)
        this.parent=parent
        this.segment=segment
        return new Proxy(this,this.handler)
    }
    toJSON() {
        throw new Error("Method not implemented.");
    }
    [checkValid](): SMap<ResourceError> {
        throw new Error("Method not implemented.");
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        throw new Error("Method not implemented.");
    }

}