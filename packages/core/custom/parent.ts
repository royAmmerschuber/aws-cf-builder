import { SMap, pathItem, Preparable } from "../general";
import { InlineAdvField } from "../field";
import { resourceIdentifier, checkValid, prepareQueue, s_path, getRef } from "../symbols";
import { modulePreparable } from "../stackBackend";
import { Resource } from "../generatables/resource";
import { ReferenceField } from "../fields/referenceField";
import { AttributeField } from "../fields/attributeField";

export const Parent: SMap<SMap<{ r: ReferenceField, a: SMap<AttributeField> }>> = new Proxy({
    subHandler: {
        get(target,p,rec){
            if (typeof p != "string") {
                throw new Error("non string property access not allowed on parent reference")
            }
            return {
                r:new ParentReferenceField(target.area,p),
                a:ParentAttributeField.createMap(target.area,p)
            }
        }
    } as ProxyHandler<{area:string}>
}, {
    get(target, p, rec) {
        if (typeof p != "string") {
            throw new Error("non string property access not allowed on parent reference")
        }
        return new Proxy({
            area:p
        },target.subHandler)
    }
}) as any
class ParentReferenceField extends InlineAdvField<any>{
    readonly [resourceIdentifier] = "parentRef"
        ;[s_path]: pathItem
    constructor(
        private resourceArea: string,
        private resourceName: string,
        private attr = ""
    ) { super(1) }

    toJSON(): string {
        const resourceIdentifierName = `AWS::${this.resourceArea}::${this.resourceName}`
        const rec = (path: pathItem) => {
            if (path instanceof Preparable) {
                if (path instanceof Resource) {
                    if (path[resourceIdentifier] == resourceIdentifierName) {
                        return path
                    }
                }
                return rec(path[s_path])
            }
            throw `parent resource ${resourceIdentifierName} not found`
        }
        const resource = rec(this[s_path])
        return resource[getRef]()
    }
    [checkValid]() {
        return {}
    }
    [prepareQueue](module: modulePreparable, path: pathItem, ref: boolean): void {
        this[s_path] = path
    }
}
class ParentAttributeField extends InlineAdvField<any>{
    [resourceIdentifier]="parrentAttr";
    [s_path]:pathItem
    private static mapHandler:ProxyHandler<{area:string,name:string}>={
        get(target,p,rec){
            if (typeof p != "string") {
                throw new Error("non string property access not allowed on parent reference")
            }
            return new ParentAttributeField(target.area,target.name,p)
        }
    }
    static createMap(area:string,name:string){
        return new Proxy({
            area:area,
            name:name
        },ParentAttributeField.mapHandler)
    }
    constructor(
        private resourceArea:string,
        private resourceName:string,
        private attr:string
    ){ super(1) }
    toJSON() {
        const resourceIdentifierName = `AWS::${this.resourceArea}::${this.resourceName}`
        const rec = (path: pathItem) => {
            if (path instanceof Preparable) {
                if (path instanceof Resource) {
                    if (path[resourceIdentifier] == resourceIdentifierName) {
                        return path
                    }
                }
                return rec(path[s_path])
            }
            throw `parent resource ${resourceIdentifierName} not found`
        }
        const resource = rec(this[s_path])
        return {"Fn::GetAtt":[
            resource[getRef]().Ref,
            this.attr
        ]}
    }
    [checkValid]() {
        return {}
    }
    [prepareQueue](module: modulePreparable, path: pathItem, ref: boolean): void {
        this[s_path] = path
    }
}