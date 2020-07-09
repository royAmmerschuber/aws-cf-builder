import { Field } from "aws-cf-builder-core/field";
import { SMap } from "aws-cf-builder-core/general";
import { ChildProcess } from "child_process";

export interface SMDefinitionOut{
    Version?:Field<string>
    Comment?:Field<string>
    TimeoutSeconds:Field<number>
    StartAt:Field<string>
    States:SMap<Field<StateOut>>
}
export type StateOut=
    StateOut.Pass |
    StateOut.Task |
    StateOut.Choice |
    StateOut.Wait |
    StateOut.Succeed |
    StateOut.Fail |
    StateOut.Parallel |
    StateOut.Map 
export namespace StateOut{
    interface BaseState{
        Type:Field<string>
        Comment?:Field<string>
    }
    interface InOutPathState extends BaseState{
        InputPath?:Field<string>
        OutputPath?:Field<string>
    }
    interface ActionState extends InOutPathState{
        Parameters?:any
        ResultPath?:Field<string>
        Next?:Field<string>
        End?:true
    }
    export interface Retrier{
        ErrorEquals:Field<string>[]
        IntervalSeconds:Field<number>
        MaxAttempts:Field<number>
    }
    export interface Catcher{
        ErrorEquals:Field<string>[]
        Next:Field<string>
    }
    export interface Pass extends ActionState{
        Type:"Pass"
        Result?:any
    }
    export interface Task extends ActionState{
        Type:"Task"
        Resource:Field<string>
        TimeoutSeconds?:Field<number>
        HeartbeatSeconds?:Field<number>
        Retry:Retrier[]
        Catch:Catcher[]
    }
    export interface Parallel extends ActionState{
        Type:"Parallel"
        Branches:Field<SMDefinitionOut>[]
        Retry:Retrier[]
        Catch:Catcher[]
    }
    export interface Map extends ActionState{
        Type:"Map"
        Iterator:Field<SMDefinitionOut>
        ItemsPath?:Field<string>
        MaxConcurrency?:Field<number>
        Retry:Retrier[]
        Catch:Catcher[]
    }
    export interface Choice extends InOutPathState{
        Type:"Choice"
        Choices:(Choice.Choice & {Next:Field<string>})[]
        Default?:Field<string>
    }
    export namespace Choice{
        export type stringChoices=
            "StringEquals" |
            "StringLessThan" |
            "StringGreaterThan" |
            "StringLessThanEquals" |
            "StringGreaterThanEquals"
        export type numericChoices=
            "NumericEquals" |
            "NumericLessThan" |
            "NumericGreaterThan" |
            "NumericLessThanEquals" |
            "NumericGreaterThanEquals"
        export type booleanChoices="BooleanEquals"
        export type timestampChoices=
            "TimestampEquals" |
            "TimestampLessThan" |
            "TimestampGreaterThan" |
            "TimestampLessThanEquals" |
            "TimestampGreaterThanEquals"
        export type Choice=Field<
            ( 
                {[k in stringChoices]?:Field<string>} |
                {[k in numericChoices]?:Field<number>} |
                {[k in booleanChoices]?:Field<boolean>} |
                {[k in timestampChoices]?:Field<string>}
            ) & {Variable:Field<string>} |
            And |
            Or |
            Not
        >
        type And={
            And:Field<Choice>[]
        }
        type Or={
            Or:Field<Choice>[]
        }
        type Not={
            Not:Field<Choice>
        }
    }
    export interface Wait extends InOutPathState{
        Type:"Wait"
        Seconds?:Field<number>
        SecondsPath?:Field<string>
        Timestamp?:Field<string>
        TimestampPath?:Field<string>
        Next?:Field<string>
        End?:true
    }
    export interface Succeed extends InOutPathState{
        Type:"Succeed"
    }
    export interface Fail extends BaseState{
        Type:"Fail"
        Error:Field<string>
        Cause:Field<string>
    }
}