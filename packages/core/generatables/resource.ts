import { Generatable } from "../general";
import { getRef, resourceIdentifier, getName } from "../symbols";
import { generateUniqueIdentifier } from "../util";

export abstract class Resource extends Generatable{
    [getRef]():string{
        return `${this[resourceIdentifier]}.${this[getName]()}`
    }
    [getName]():string{
        return generateUniqueIdentifier(this)
    }
}