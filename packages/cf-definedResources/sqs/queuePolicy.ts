import { Resource } from "aws-cf-builder-core/generatables/resource";
import { generateObject, resourceIdentifier, checkValid, prepareQueue, checkCache, stacktrace, s_path } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { callOnPrepareQueue, callOnCheckValid, prepareQueueBase } from "aws-cf-builder-core/util";
import { Field } from "aws-cf-builder-core/field";
import { findInPath } from "aws-cf-builder-core/util";
import { PolicyDocument, PolicyOut } from "../iam/policy/policyDocument";
import { Queue } from "./queue";
import { refPlaceholder } from "aws-cf-builder-core/refPlaceholder";

export class QueuePolicy extends Resource {
    [resourceIdentifier] = "AWS::SQS::QueuePolicy"
    private document: Field<PolicyOut>
    private queues = new Set<Field<string>>()
    constructor() { super(0) }
    Document(doc: PolicyDocument | Field<PolicyOut>) {
        this.document = doc
        return this
    }
    [generateObject]() {
        if (!this.queues.size) {
            throw new PreparableError(this, "you must attach this policy to atleast one queue")
        }
        return {
            Type: this[resourceIdentifier],
            Properties: {
                PolicyDocument: this.document,
                Queues: [...this.queues]
            }
        }
    }
    [checkValid](): SMap<ResourceError> {
        if (this[checkCache]) return this[checkCache]
        const out: SMap<ResourceError> = {}
        const errors: string[] = []
        if (!this.document) {
            errors.push("you must specify a Document")
        }
        if (errors.length) {
            out[this[stacktrace]] = {
                type: this[resourceIdentifier],
                errors
            }
        }
        return this[checkCache] = callOnCheckValid(this.document, out)
    }
    [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
        if (ref) {
            stack.resources.add(new refPlaceholder(this, path))
        } else {
            if (this[s_path] === undefined) {
                this[s_path] = path
                stack.resources.add(this)
                callOnPrepareQueue(this.document, stack, path, true)
            }
            const { queue } = findInPath(path, { queue: Queue })
            if (queue) {
                this.queues.add(queue.obj.r)
            }
        }
    }

}