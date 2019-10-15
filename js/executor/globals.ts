import { Module } from "../general/generatables/module"
import { Variable } from "../general/generatables/variable"
import { Output } from "../general/generatables/output"
import { customProvider } from "../custom/provider"
require("ts-node").register({transpileOnly:true})
//@ts-ignore
global.Custom=customProvider
//@ts-ignore
global.Module=Module
//@ts-ignore
global.Variable=Variable
//@ts-ignore
global.Output=Output 