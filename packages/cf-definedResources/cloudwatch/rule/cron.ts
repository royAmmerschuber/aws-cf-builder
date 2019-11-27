import { Field } from "aws-cf-builder-core/field";
import { resourceIdentifier, checkValid, stacktrace } from "aws-cf-builder-core/symbols";
import _ from "lodash/fp"
import { Substitution } from "aws-cf-builder-core/fields/substitution";

export class CronExpression extends Substitution{
    [resourceIdentifier]="CronExpression"
    /**
     * @param minutes between:`0-59` wildcards:`,` `-` `*` `/` default:`*`
     * @param hours between:`0-23` wildcards:`,` `-` `*` `/` default:`*`
     * @param dayOfMonth between:`1-31` wildcards:`,` `-` `*` `/` `?` `L` `W` default:`*`
     * @param month between:`1-12` or `JAN-DEC` wildcards:`,` `-` `*` `/` default:`*`
     * @param dayOfWeek between:`1-31` or `SUN-SAT` wildcards:`,` `-` `*` `/` `?` `L` `#` default:`?`
     * @param year between:`1970-2199` wildcards:`,` `-` `*` `/` `?` default:`*`
     */
    constructor(
        minutes:Field<wildcard|number>="*",
        hours:Field<wildcard|number>="*",
        dayOfMonth:Field<wildcard|number>="*",
        month:Field<wildcard|MonthString|number>="*",
        dayOfWeek:Field<wildcard|WeekdayString|number>="?",
        year:Field<wildcard|number>="*"
    ){
        super(2,...(
            ((text,...args)=>[text,args])
                `cron(${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek} ${year})` as [string[],any[]]
        ))
    }
    ;[checkValid]() {
        const out=super[checkValid]()
        const errors:string[]=[]
        const regCheck=(s:any,pattern:RegExp,numPattern:RegExp,err:string)=>{
            const reg=new RegExp(pattern.source.replace(/\\d\{1,2}/g,numPattern.source));
            if(typeof s=="string" && !reg.test(s)){
                errors.push(err)
            }
        }
        const basicReg=/^(?:\*|\d{1,2}(?:[-/]\d{1,2}|(?:,\d{1,2})*))$/;
        const domReg=/^(?:[*LW?]|\d{1,2}(?:[-/]\d{1,2}|(?:,\d{1,2})*))$/;
        const dowReg=/^(?:[*L?]|\d{1,2}(?:[-/#]\d{1,2}|(?:,\d{1,2})*))$/;
        const [minutes,hours,dayOfMonth,month,dayOfWeek,year]=this.args
        regCheck(
            minutes,basicReg,
            /(?:[0-9]|[1-5][0-9])/,
            "schedule Error: the minutes have invalid caracters"
        )
        regCheck(
            hours,basicReg,
            /(?:[0-9]|1[0-9]|2[0-3])/,
            "schedule Error: the hours have invalid caracters"
        )
        regCheck(
            dayOfMonth,domReg,
            /(?:[1-9]|[1-2][0-9]|3[0-1])/,
            "schedule Error: the dayOfMonth has an invalid caracters"
        )
        regCheck(
            month,basicReg,
            /(?:[1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OKT|NOV|DEC)/,
            "schedule Error: the month have invalid caracters"
        )
        regCheck(
            dayOfWeek,dowReg,
            /(?:[1-7]|SUN|MON|TUE|WEN|THU|FRI|SAT)/,
            "schedule Error: the dayOfWeek has an invalid caracters"
        )
        regCheck(
            year,basicReg,
            /(?:19[7-9]\d|2[0-1]\d{2})/,
            "schedule Error: the years have invalid caracters"
        )
        if(errors.length){
            const error=out[this[stacktrace]]
            if(error){
                error.errors.push(...errors)
            }else{
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors:errors
                }
            }
        }
        return out
    }
}
export type wildcard=string
export type MonthString="JAN"|"FEB"|"MAR"|"APR"|"MAY"|"JUN"|"JUL"|"AUG"|"SEP"|"OKT"|"NOV"|"DEC"
export type WeekdayString="SUN"|"MON"|"TUE"|"WEN"|"THU"|"FRI"|"SAT"