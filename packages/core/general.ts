import { getShortStack } from "./utilLow";
import { stackPreparable } from "./stackBackend";
import _ from "lodash/fp"
import { checkCache, stacktrace, resourceIdentifier, checkValid, prepareQueue, generateObject, s_path, pathName, s_isAliased } from "./symbols";
import chalk from "chalk";
import { pathable, pathItem } from "./path";
// @ts-ignore


export interface SMap<T> {
    [k: string]: T
}

export interface ResourceError {
    type: string,
    errors: string[]
}

export abstract class Preparable implements pathable {
    [stacktrace]: string;
    [s_path]: pathItem
    protected [checkCache]: SMap<ResourceError>

    abstract [resourceIdentifier]: string;

    constructor(errorDepth) {
        this[stacktrace] = getShortStack(2 + errorDepth);
    }

    abstract [checkValid](): SMap<ResourceError>
    abstract [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void
}
export abstract class Generatable extends Preparable {
    abstract [generateObject](): any;
}
export class PreparableError extends Error {
    constructor(prep: Preparable, ...errors: [string, ...string[]])
    constructor(stack: string, identifier: string, ...errors: string[])
    constructor(ps: Preparable | string, ie: string, ...errors: string[]) {
        if (typeof ps == "string") {
            super([
                ps,
                chalk.yellow(ie),
                ...errors
            ].join("\n"))
        } else {
            super([
                ps[stacktrace],
                chalk.yellow(ps[resourceIdentifier]),
                ie,
                ...errors
            ].join("\n"))
        }
    }
}
export interface Aliasable{
    readonly [s_isAliased]:boolean
}