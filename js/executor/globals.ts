import { Custom } from "../custom"
import { Module } from "../general/module"
require("ts-node").register({transpileOnly:true})
//@ts-ignore
global.Custom=Custom
//@ts-ignore
global.Module=Module