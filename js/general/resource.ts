import { TopLevelGeneratable } from "./general";
import { getRef, resourceIdentifier, getName, resourceName } from "./symbols";
import { generateUniqueIdentifier } from "./util";

export abstract class Resource extends TopLevelGeneratable{
    [resourceName]:string
    [getRef]():string{
        return this[resourceIdentifier]+"."+this[getName]
    }
    [getName]():string{
        if(this[resourceName]){
            return this[resourceName]
        }
        return this[resourceName]=generateUniqueIdentifier(this)
    }
}