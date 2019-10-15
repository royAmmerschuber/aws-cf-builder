import * as module from "../general/generatables/module"
import * as customP from "../custom/provider"
import * as customB from "../custom/block"
import * as customParent from "../custom/parent"
import * as variable from "../general/generatables/variable"
import * as output from "../general/generatables/output"
declare global{
    export const Module:typeof module.Module
    export const Custom:(new (name:string)=>customP.CustomProvider) & {
        B:new ()=>customB.CustomBlock,
        P:typeof customParent.Parent
    }
    export const Variable:typeof variable.Variable
    export const Output:typeof output.Output
}