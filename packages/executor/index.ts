import * as path from "path"

import { StackBackend } from "aws-cf-builder-core/stackBackend"
import chalk from "chalk"
import * as _ from "lodash/fp"
import * as tsN from "ts-node"
import { ResourceError, SMap } from "aws-cf-builder-core/general"
let yaml: typeof import("js-yaml")

function printErrors(errs: SMap<ResourceError>):string {
    return _.flow(
        _.toPairs,
        _.map((v: [string, ResourceError]) => `${ v[0] }\n${ chalk.yellow(v[1].type) }\n${ v[1].errors.join("\n") }\n`),
        _.join("\n")
    )(errs)
}
export interface TransformOptions {
    typescript?: boolean,
    check?: boolean,
    indent?: boolean,
    yaml?: boolean,
    sam?: boolean,
    transform?: string
}
export function transform(file: string, options: TransformOptions): string {
    if (options.typescript) {
        try {
            const opt: tsN.Options = {
                compilerOptions: {
                    typeRoots: [
                        path.join(__dirname, "./types")
                    ],
                },
                transpileOnly: !options.check
            }
            require("ts-node").register(opt)
        } catch (ex) {
            throw new Error(chalk`{red couldnt load module {redBright "ts-node"}}\n try running "{green npm install typescript ts-node}"`)
        }
    } else if (options.check) {
        throw new Error(chalk`{red if you specify {redBright --check} then you also need to specify {redBright --typescript}}`)
    }
    if (options.yaml) {
        try {
            yaml = require("js-yaml")
        } catch (e) {
            throw new Error(chalk` {red couldnt load module {redBright "js-yaml"}}\n try running "{green npm install js-yaml}"`)
        }
    }
    if (options.sam) {
        if (options.transform) {
            throw new Error(chalk`{red do not specify a {redBright --transform} flag if you are using the {redBright --sam} flag}`)
        }
        options.transform = "AWS::Serverless-2016-10-31"
    }

    require("./globals")

    const mainModule = new StackBackend(require(file))
    const errors = mainModule.checkValid()
    if (_.size(errors) > 0) {
        throw new Error(printErrors(errors))
    }
    const modules = new Set<StackBackend>()
    mainModule.prepareQueue(modules)

    let outputJSON: string
    const outputObject = mainModule.generateObject()

    outputObject.Transform = options.transform
    outputJSON = JSON.stringify(outputObject, null, options.indent ? 4 : 0)
    if (options.yaml) {
        outputJSON = yaml.safeDump(JSON.parse(outputJSON))
    }
    return outputJSON
}