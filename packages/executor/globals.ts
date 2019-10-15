import { Module } from "../core/generatables/module"
import { Variable } from "../core/generatables/variable"
import { Output } from "../core/generatables/output"
import { customProvider } from "../core/custom/provider"
require("ts-node").register({transpileOnly:true})
//@ts-ignore
global.Custom=customProvider
//@ts-ignore
global.Module=Module
//@ts-ignore
global.Variable=Variable
//@ts-ignore
global.Output=Output 