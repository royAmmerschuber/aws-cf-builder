import { Output } from "aws-cf-builder-core/generatables/output"
import { Custom } from "aws-cf-builder-core/custom/resource"
import { Parameter } from "aws-cf-builder-core/generatables/parameter"
import { Sub } from "aws-cf-builder-core/fields/substitution"
//@ts-ignore
global.Custom=Custom
//@ts-ignore
global.Parameter=Parameter
//@ts-ignore
global.Output=Output 
//@ts-ignore
global.Sub=Sub