import * as module from "../../core/generatables/module"
import * as customP from "../../core/custom/provider"
import * as customB from "../../core/custom/block"
import * as customParent from "../../core/custom/parent"
import * as variable from "../../core/generatables/variable"
import * as output from "../../core/generatables/output"
declare global{
    export const Module:typeof module.Module
    export const Custom:(new (name:string)=>customP.CustomProvider) & {
        B:new ()=>customB.CustomBlock,
        P:typeof customParent.Parent
    }
    export const Variable:typeof variable.Variable
    export const Output:typeof output.Output
}