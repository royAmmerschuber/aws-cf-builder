import { Generatable } from "./general";
import { getRef, resourceIdentifier, resourceName } from "./symbols";

export abstract class Resource extends Generatable{
    [resourceName]:string
    [getRef]():string{
        return this[resourceIdentifier]+"."+this[resourceName]
    }
}