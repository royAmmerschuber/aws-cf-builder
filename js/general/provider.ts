import { SMap, TopLevelGeneratable, pathItem } from "./general";
import { Resource } from "./resource";
import { cleanTextForIdentifier } from "./util";
import _ from "lodash";
import { s_path } from "./symbols";
const isDefault=Symbol("isDefault")
const numberOfRefs=Symbol("numberOfRefs")
export const provSym={
    isDefault:isDefault,
    numberOfRefs:numberOfRefs
}
export abstract class Provider extends TopLevelGeneratable{
    public resources:SMap<()=>Resource>
    ;[isDefault]=false
    ;[numberOfRefs]=0
}
