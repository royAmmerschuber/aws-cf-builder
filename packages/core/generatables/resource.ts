import { Generatable } from "../general";
import { getRef, resourceIdentifier, getName } from "../symbols";
import { generateUniqueIdentifier } from "../util";
import { ReferenceField } from "../fields/referenceField";

export abstract class Resource extends Generatable{
    r:ReferenceField

    [getRef](){
        return {
            Ref:this[getName]()
        }
    }
    [getName]():string{
        return generateUniqueIdentifier(this)+this[resourceIdentifier].split("::")[2]
    }
}