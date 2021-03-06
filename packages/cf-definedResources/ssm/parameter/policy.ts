import { InlineAdvField, Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, prepareQueue, stacktrace, toJson } from "aws-cf-builder-core/symbols";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { callOnCheckValid, callOnPrepareQueue } from "aws-cf-builder-core/util";
import _ from "lodash/fp"

export type Unit = "Days" | "Hours"
export type PolicyOut = ExpirationPolicyOut | ExpirationNotificationPolicyOut | NoChangeNotificationPolicyOut
export interface ExpirationPolicyOut {
    Type: Field<"Expiration">
    Version: Field<"1.0">
    Attributes: {
        Timestamp: Field<string>
    }
}
export interface ExpirationNotificationPolicyOut {
    Type: Field<"ExpirationNotification">
    Version: Field<"1.0">
    Attributes: {
        Before: Field<string>
        Unit: Field<Unit>
    }
}
export interface NoChangeNotificationPolicyOut {
    Type: Field<"NoChangeNotification">
    Version: Field<"1.0">
    Attributes: {
        After: Field<string>
        Unit: Field<Unit>
    }
}
export namespace Policy {
    export class Expiration extends InlineAdvField<ExpirationPolicyOut>{
        [resourceIdentifier] = "ExpirationPolicy"
        private timestamp: Field<string>
        constructor(){super(1)}
        Timestamp(time: Field<string> | Date) {
            if (time instanceof Date) {
                this.timestamp = time.toISOString()
            } else {
                this.timestamp = time
            }
            return this
        }
        [toJson](): ExpirationPolicyOut {
            return {
                Type: "Expiration",
                Version: "1.0",
                Attributes: {
                    Timestamp: this.timestamp
                }
            }
        }
        [checkValid]() {
            let out: SMap<ResourceError>
            if (!this.timestamp) {
                out = {
                    [this[stacktrace]]: {
                        errors: ["you must specify a Timestamp"],
                        type: this[resourceIdentifier],
                    }
                }
            } else {
                out = {}
            }
            if (this.timestamp instanceof Preparable) {
                out = _.assign(out, this.timestamp[checkValid]())
            }
            return out
        }
        [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
            if (this.timestamp instanceof Preparable) {
                this.timestamp[prepareQueue](stack, path, true)
            }
        }
    }
    export class ExpirationNotification extends InlineAdvField<ExpirationNotificationPolicyOut>{
        [resourceIdentifier] = "ExpirationNotificationPolicy"
        private before: Field<string>
        private unit: Field<Unit>
        constructor(){super(1)}
        Before(time: Field<number | string>, unit: Field<Unit>) {
            if (typeof time == "number") {
                this.before = String(time)
            } else {
                this.before = time
            }
            this.unit = unit
            return this
        }
        [toJson](): ExpirationNotificationPolicyOut {
            return {
                Type: "ExpirationNotification",
                Version: "1.0",
                Attributes: {
                    Before: this.before,
                    Unit: this.unit
                }
            }
        }
        [checkValid]() {
            let out: SMap<ResourceError>
            if (!this.before) {
                out = {
                    [this[stacktrace]]: {
                        errors: ["you must specify a Before"],
                        type: this[resourceIdentifier],
                    }
                }
            } else {
                out = {}
            }
            return callOnCheckValid([this.unit, this.before],out)
        }
        [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
            callOnPrepareQueue([this.unit, this.before], stack, path, true)
        }
    }
    export class NoChangeNotification extends InlineAdvField<NoChangeNotificationPolicyOut>{
        [resourceIdentifier] = "NoChangeNotificationPolicy"
        private after: Field<string>
        private unit: Field<Unit>
        constructor(){super(1)}
        After(time: Field<number | string>, unit: Field<Unit>) {
            if (typeof time == "number") {
                this.after = String(time)
            } else {
                this.after = time
            }
            this.unit = unit
            return this
        }
        [toJson](): NoChangeNotificationPolicyOut {
            return {
                Type: "NoChangeNotification",
                Version: "1.0",
                Attributes: {
                    After: this.after,
                    Unit: this.unit
                }
            }
        }
        [checkValid]() {
            let out: SMap<ResourceError>
            if (!this.after) {
                out = {
                    [this[stacktrace]]: {
                        errors: ["you must specify a After"],
                        type: this[resourceIdentifier],
                    }
                }
            } else {
                out = {}
            }
            return callOnCheckValid([this.unit, this.after], out)
        }
        [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
            callOnPrepareQueue([this.unit, this.after],stack, path, true)
        }
    }
}