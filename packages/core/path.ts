import { pathName, s_path } from "./symbols";
import { SMap } from "./general";

export type pathItem=string[]|pathable
export interface namedPath extends pathable{
    [pathName]():string
}
export interface pathable{
    [s_path]:pathItem
}
export class PathDataCarrier implements pathable{
    [s_path]:pathItem
    constructor(path:pathItem,public data:SMap<any>){
        this[s_path]=path
    }
}
export class NamedPath implements namedPath{
    [pathName]() {
        return this.name
    }
    [s_path]: pathItem;
    
    constructor(path:pathItem,private name:string){
        this[s_path]=path
    }
}