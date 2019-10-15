import { SMap, pathItem, Generatable } from "../general/general";
import { Reference, InlineAdvField } from "../general/field";
import { resourceIdentifier, generateExpression, checkValid, prepareQueue, s_path, getRef } from "../general/symbols";
import { modulePreparable } from "../general/moduleBackend";
import { Resource } from "../general/generatables/resource";

export const Parent = new Proxy({} as SMap<Reference<any>>, {
    get(target, p, rec) {
        if (typeof p != "string") {
            throw new Error("non string property access not allowed on parent reference")
        }
        return new ParentReference(p) as any
    }
})
class ParentReference extends InlineAdvField<any>{
    readonly [resourceIdentifier]="parentRef"
    ;[s_path]:pathItem
    constructor(
        private resourceName: string,
        private attr = ""
    ) {
        super(1)
        return new Proxy(this, {
            get(t, p) {
                if (typeof p == "symbol") {
                    const v = t[p as any]
                    if (v instanceof Function) {
                        return (...args) => (t[p as any] as Function).call(t, ...args);
                    }
                    return t[p as any]
                } else if (isNaN(Number(p))) {
                    if (p == "toJSON") {
                        return () => t.toJSON()
                    }
                    return new ParentReference(resourceName, `${attr}.${p}`)
                } else {
                    return new ParentReference(resourceName, `${attr}[${p}]`)
                }
            }
        })
    }

    [generateExpression](): string {
        const rec=(path:pathItem)=>{
            if(path instanceof Generatable){
                if(path instanceof Resource){
                    if(path[resourceIdentifier]==this.resourceName){
                        return path
                    }
                }
                return rec(path[s_path])
            }
            throw `parent resource ${this.resourceName} not found`
        }
        const resource=rec(this[s_path])
        return resource[getRef]()+this.attr
    }
    [checkValid]() {
        return {}
    }
    [prepareQueue](module: modulePreparable, path: pathItem, ref: boolean): void {
        this[s_path]=path
    }


}