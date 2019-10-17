import { Variable } from "tf-builder-core/generatables/variable"
import { Output } from "tf-builder-core/generatables/output"
import { customProvider } from "tf-builder-core/custom/provider"
//@ts-ignore
global.Custom=customProvider
//@ts-ignore
global.Variable=Variable
//@ts-ignore
global.Output=Output 