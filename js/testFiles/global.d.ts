import * as module from "../general/module"
import * as custom from "../custom"
import * as variable from "../general/variable"
import * as output from "../general/output"
declare global{
    function Module<T>(p:T):module.Module<T>
    function Custom(name:string):custom.CustomProvider
    function Variable<T>():variable.Variable<T>
    function Output<T>():output.Output<T>
}