import { Generatable } from "../general";
import { getRef, resourceIdentifier, getName } from "../symbols";
import { generateUniqueIdentifier } from "../util";
import { ReferenceField } from "../fields/referenceField";

export abstract class Resource extends Generatable{
    r=new ReferenceField(this)

    public [getName]():string{
        return generateUniqueIdentifier(this)+this[resourceIdentifier].split("::")[2]
    }
}