import { Generatable, SMap } from "./general";
import { Resource } from "./resource";

export abstract class Provider extends Generatable{
    public resources:SMap<()=>Resource>
}