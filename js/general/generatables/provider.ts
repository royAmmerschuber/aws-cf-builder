import { SMap, Generatable } from "../general";
import { Resource } from "./resource";
import _ from "lodash";

const isDefault=Symbol("isDefault")
const numberOfRefs=Symbol("numberOfRefs")
export const provSym={
    isDefault:isDefault,
    numberOfRefs:numberOfRefs
}
export abstract class Provider extends Generatable{
    public resources:SMap<new ()=>Resource>
    ;[isDefault]=false
    ;[numberOfRefs]=0
}
