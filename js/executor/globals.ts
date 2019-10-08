import { Custom } from "../custom"
import { Module } from "../general/module"
import { Variable } from "../general/variable"
import { Output } from "../general/output"
require("ts-node").register({transpileOnly:true})
//@ts-ignore
global.Custom=Custom
//@ts-ignore
global.Module=Module
//@ts-ignore
global.Variable=Variable
//@ts-ignore
global.Output=Output 