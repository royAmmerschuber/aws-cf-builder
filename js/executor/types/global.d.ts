import * as module from "../../general/module"
import * as custom from "../../custom"
declare global{
    function Module():module.Module
    function Custom(name:string):custom.CustomProvider
}