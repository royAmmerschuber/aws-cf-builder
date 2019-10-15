import { Generatable } from "../general";
import { resourceName,getRef,resourceIdentifier} from "../symbols"
//TODO
export abstract class DataSource extends Generatable{
    [resourceName]:string
    [getRef]():string{
        return "data."+this[resourceIdentifier]+"."+this[resourceName]
    }
}