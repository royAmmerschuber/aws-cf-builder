import { Field } from "aws-cf-builder-core/field";
import { resourceIdentifier } from "aws-cf-builder-core/symbols";
import { Substitution } from "aws-cf-builder-core/fields/substitution";

export type TimeUnit=
    "minute" | 
    "minutes" | 
    "hour" | 
    "hours" | 
    "day" | 
    "days";
export class RateExpression extends Substitution{
    [resourceIdentifier]="RateExpression"
    constructor(value:Field<number>,unit:Field<TimeUnit> ){
        super(2,...(
            ((...args)=>args)`rate(${value} ${unit})` as [readonly string[],any[]]
        ))
    }
}