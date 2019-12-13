import _ from "lodash/fp";
import { Resource } from "aws-cf-builder-core/generatables/resource";
import { resourceIdentifier, checkValid, stacktrace, checkCache, prepareQueue, generateObject } from "aws-cf-builder-core/symbols";
import { Field } from "aws-cf-builder-core/field";
import { SMap, ResourceError, Preparable } from "aws-cf-builder-core/general";
import { callOn, prepareQueueBase, notEmpty } from "aws-cf-builder-core/util";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { pathItem } from "aws-cf-builder-core/path";
import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";
import { TargetOut, Target as RuleTarget } from "./target";
import { RateExpression } from "./rate";
import { CronExpression } from "./cron";
export type TimeUnit=
    "minute" | 
    "minutes" | 
    "hour" | 
    "hours" | 
    "day" | 
    "days";
/**
 * The AWS::Events::Rule resource creates a rule that matches incoming 
 * Amazon CloudWatch Events (CloudWatch Events) events and routes them 
 * to one or more targets for processing. For more information, see 
 * Using CloudWatch Events in the Amazon CloudWatch User Guide.
 * 
 * [cloudformation reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-rule.html)
 */
export class Rule extends Resource{
    readonly [resourceIdentifier]="AWS::Events::Rule";
    //#region properties
    private _:{
        name:Field<string>
        description: Field<string>
        state: Field<"ENABLED" | "DISABLED">
        schedule: Field<string>
        targets: Field<TargetOut>[]
        eventPattern:Field<EventPattern>
    }={
        targets:[]
    } as any
    //#endregion
    /**
     * event rule ID, such as `mystack-ScheduledRule-ABCDEFGHIJK`.
     */
    r:ReferenceField
    a={
        /**
         * The ARN of the rule, such as `arn:aws:events:us-east-2:123456789012:rule/example`.
         */
        Arn:new AttributeField(this,"Arn")
    }
    /**
     * @param name A name for the rule. If you don't specify a name, 
     * AWS CloudFormation generates a unique physical ID and uses that 
     * ID for the rule name. For more information, see Name Type.
     * 
     * **maps:** `Name`
     * @param useName if the name should be used for the resource
     * > **Important**
     * > 
     * > If you specify a name, you cannot perform updates that require 
     * > replacement of this resource. You can perform updates that require 
     * > no or some interruption. If you must replace the resource, specify 
     * > a new name.
     */
    constructor(){
        super(1);
    }

    //#region simple properties
    name(name:Field<string>){
        this._.name=name
        return this
    }
    /**
     * **required:false**
     * @param text A description of the rule's purpose.
     * 
     * **maps:**`Description`
     */
    description(text:Field<string>){
        this._.description=text;
        return this;
    }
    /**
     * **required:false**
     * @param state Indicates whether the rule is enabled. For valid values, see 
     * the State parameter for the PutRule action in the Amazon CloudWatch 
     * Events API Reference.
     * 
     * **maps:**`State`
     */
    state(state:Field<"ENABLED" | "DISABLED">){
        this._.state=state;
        return this;
    }
    
    /**
     * **required:Conditional. _You must specify this property, the EventPattern 
     * property, or both._**
     * 
     * **maps:**`ScheduleExpression`
     * @param string The schedule or rate (frequency) that determines when 
     * CloudWatch Events runs the rule. For more information, see Schedule 
     * Expression Syntax for Rules in the Amazon CloudWatch User Guide.
     * 
     * [reference](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)
     * 
     */
    Schedule(scheduleExpression:Field<string>|Rule.Schedule.Cron|Rule.Schedule.Rate):this{
        this._.schedule=scheduleExpression
        return this;
    }
    /**
     * **required: Conditional. _You must specify this property, the 
     * ScheduleExpression property, or both._**
     * @param JSONPattern Describes which events CloudWatch Events routes to the 
     * specified target. These routed events are matched events. For more 
     * information, see Events and Event Patterns in the Amazon CloudWatch User 
     * Guide.
     * 
     * **maps:**`EventPattern`
     */
    EventPattern(JSONPattern:Field<EventPattern>){
        this._.eventPattern=JSONPattern;
        return this;
    }
    //#endregion

    //#region subresources
    /**
     * **required:false**
     * @param targets The resources, such as Lambda functions or Kinesis streams, 
     * that CloudWatch Events routes events to and invokes when the rule is 
     * triggered. For information about valid targets, see the PutTargets action 
     * in the Amazon CloudWatch Events API Reference.
     * 
     * > **Note**
     * > 
     * > Creating rules with built-in targets is supported only in the AWS 
     * > Management Console.
     * 
     * **maps:** `Targets`
     */
    targets(...targets:(Field<TargetOut>|Rule.Target)[]){
        this._.targets.push(...targets);
        return this;
    }
    
    //#endregion

    //#region resource functions
    [checkValid](){
        if(this[checkCache]) return this[checkCache]
        const out:SMap<ResourceError>={}
        const errors:string[]=[];
        if(!(this._.schedule || this._.eventPattern)){
            errors.push("You must specify the Schedule property, the EventPattern property, or both.")
        }
        if(errors.length){
            out[this[stacktrace]]={
                type:this[resourceIdentifier],
                errors:errors
            }
        }
        return this[checkCache]=callOn(this._,Preparable,o => o[checkValid]())
            .reduce<SMap<ResourceError>>(_.assign,out)
    }

    [prepareQueue](stack:stackPreparable,path:pathItem,ref:boolean){
        if(prepareQueueBase(stack,path,ref,this)){
            callOn(this._,Preparable,o => o[prepareQueue](stack,this,true))
        }
    }

    [generateObject](){
        return {
            Type:this[resourceIdentifier],
            Properties:{
                Name:this._.name,
                ScheduleExpression:this._.schedule,
                EventPattern:this._.eventPattern,
                Description:this._.description,
                State:this._.state,
                Targets:notEmpty(this._.targets)
            }
        }
    }

    //#endregion
}
export namespace Rule{
    export namespace Schedule{
        export const Rate=RateExpression
        export type Rate=RateExpression
        export const Cron=CronExpression
        export type Cron=CronExpression
    }
    export const Target=RuleTarget
    export type Target=RuleTarget
}
export interface EventPattern{
    version:Field<string>,
    id:Field<string>,
    "detail-type":Field<string>,
    source:Field<string>,
    account:Field<string>,
    time:Field<string>,
    region:Field<string>,
    resources:Field<string>[],
    detail:any
}