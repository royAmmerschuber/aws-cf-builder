import * as module from "../../general/module"
import * as custom from "../../custom"
declare global{
    function Module<T>(p:T):module.Module<T>
    function Custom(name:string):custom.CustomProvider
}