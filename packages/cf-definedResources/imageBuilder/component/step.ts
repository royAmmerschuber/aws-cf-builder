import { Field, InlineAdvField } from "aws-cf-builder-core/field";
import { Sub } from "aws-cf-builder-core/fields/substitution";
import { SMap, ResourceError, PreparableError } from "aws-cf-builder-core/general";
import { PathDataCarrier, pathItem } from "aws-cf-builder-core/path";
import { stackPreparable } from "aws-cf-builder-core/stackBackend";
import { checkCache, checkValid, prepareQueue, resourceIdentifier, stacktrace, toJson } from "aws-cf-builder-core/symbols";
import { callOnCheckValid, callOnPrepareQueue, notEmpty } from "aws-cf-builder-core/util";
export type StepOut=
    StepOut.S3Upload |
    StepOut.S3Download |
    StepOut.ExecuteBash |
    StepOut.ExecutePowerShell |
    StepOut.ExecuteBinary |
    StepOut.Reboot |
    StepOut.UpdateOS |
    StepOut.SetRegistry
export namespace StepOut{
    interface Base{
        name:Field<string>
        action:Field<string>
        inputs:any
        loop?:{
            name:Field<string>
            for:{
                start: Field<number>
                end: Field<number>
                updateBy: Field<number>
            }
        } | {
            name:Field<string>
            forEach:Field<string>[] | {
                list: Field<string>
                delimiter: Field<string>
            }
        }
        timeoutSeconds?:Field<number>
        onFailure?:Field<string>
        maxAttempts?:Field<number>
    }
    export interface S3Upload extends Base{
        action:"S3Upload"
        inputs:{
            source:Field<string>
            destination:Field<string>
            recurse?:Field<boolean>
        }[]
    }
    export interface S3Download extends Base{
        action:"S3Download"
        inputs:{
            source:Field<string>
            destination:Field<string>
        }[]
    }

    export interface ExecuteBash extends Base{
        action:"ExecuteBash"
        inputs:{
            commands:Field<string>[]
        }
    }
    export interface ExecutePowerShell extends Base{
        action:"ExecuteBash"
        inputs:{
            commands:Field<string>[]
        } | {
            file:Field<string>
        }
    }
    export interface ExecuteBinary extends Base{
        action:"ExecuteBinary",
        inputs:{
            path:Field<string>,
            arguments?:Field<string>[]
        }
    }
    export interface Reboot extends Base{
        action:"Reboot",
        inputs:{
            delaySeconds?:Field<number>
        }
    }
    export interface UpdateOS extends Base{
        action:"UpdateOS"
        inputs:{
            include?:Field<string>[]
            exclude?:Field<string>[]
        }
    }
    export interface SetRegistry extends Base{
        action:"SetRegistry"
        inputs:{
            path:Field<string>
            name:Field<string>
            value:Field<string|number>|Field<string|number>[]
            type:Field<string>
        }[]
    }
}
export type RegistryType=
    "BINARY" |
    "DWORD" |
    "QWORD" |
    "SZ" |
    "EXPAND_SZ" |
    "MULTI_SZ"
export type Step=
    Step.S3Upload | 
    Step.S3Download |
    Step.Execute |
    Step.Reboot |
    Step.UpdateOS |
    Step.SetRegistry
export namespace Step{
    abstract class BaseStep<Inp> extends InlineAdvField<StepOut>{
        protected _:{
            name:Field<string>
            action:Field<string>

            loopName:Field<string>
            loop:{
                start:Field<number>
                end:Field<number>
                step:Field<number>
            } | {
                items:Field<string>[]
            } | {
                string:Field<string>
                delimiter:Field<string>
            }
            onFailure:Field<string>
            maxAttempts:Field<number>
            timeout:Field<number>
        }
        /**
         * **required:false**
         * @param name All looping constructs have an optional name field for identification. 
         * If a loop name is provided, it can be used to refer to iteration variables in the 
         * input body of the step. To refer to the iteration indices and values of a named 
         * loop, use {{ <loop_name>.* }} with {{ loop.* }} in the input body of the step. 
         * This expression cannot be used to refer to the named looping construct of another step.
         * 
         * The reference expression consists of the following members:
         * - `{{ <loop_name>.index }}` — The ordinal position of the current iteration of the 
         *   named loop, which is indexed at 0.
         * - `{{ <loop_name>.value }}` — The value associated with the current iteration variable 
         *   of the named loop. 
         * 
         * **maps:**`loop.name`
         */
        loopName(name:Field<string>){
            this._.loopName=name
            return this
        }
        /**
         * The forEach loop iterates on an explicit list of values, which can be strings 
         * and chained expressions.
         * 
         * you can refer to the iteration index with `{{ loop.index }}` and to the value with `{{ loop.value }}`
         * 
         * **required:false**
         * @param list List of strings for iteration. Accepts chained expressions as strings 
         * in the list. Chained expressions must be enclosed by double quotes for the YAML 
         * compiler to correctly interpret them.
         * 
         * **maps:**`loop.forEach`
         */
        forEach(list:Field<string>[]):this
        /**
         * The loop iterates over a string containing values separated by a delimiter. 
         * To iterate over the string’s constituents, TOE uses the delimiter to split 
         * the string into an array suitable for iteration.
         * 
         * you can refer to the iteration index with `{{ loop.index }}` and to the value with `{{ loop.value }}`
         * 
         * **required:false**
         * @param list A string that is composed of constituent strings joined by a common 
         * delimiter character. Also accepts chained expressions. In case of chained expressions, 
         * ensure that those are enclosed by double quotes for correct interpretation by the 
         * YAML compiler.
         * 
         * **maps:**`loop.forEach.list`
         * @param delimiter Character used to separate out strings within a block. Default is the comma character. Only one delimiter character is allowed from the given list:
         * - Dot: "."
         * - Comma: ","
         * - Semicolon: ";"
         * - Colon: ":"
         * - New line: "\n"
         * - Tab: "\t"
         * - Space: " "
         * - Hyphen: "-"
         * - Underscore: "_"
         * 
         * Chaining expressions cannot be used.
         * 
         * **maps:**`loop.forEach.delimiter`
         */
        forEach(list:Field<string>,delimiter:Field<string>):this
        forEach(list:Field<string>[]|Field<string>,delimiter?:Field<string>){
            if(list instanceof Array){
                this._.loop={
                    items:list
                }
            }else{
                this._.loop={
                    string:list,
                    delimiter
                }
            }
            return this
        }
        /**
         * The for loop iterates on a range of integers specified within a boundary outlined 
         * by the start and end of the variables. The iterating values are in the set 
         * [start, end] and includes boundary values.
         * 
         * AWSTOE verifies the start, end, and updateBy values to ensure that the combination 
         * does not result in an infinite loop.
         * 
         * you can refer to the loop index with `{{ loop.index }}`
         * 
         * **required:false**
         * @param start Starting value of iteration. Does not accept chaining expressions.
         * 
         * **maps:**`loop.for.start`
         * @param end Ending value of iteration. Does not accept chaining expressions.
         * 
         * **maps:**`loop.for.end`
         * @param step Difference by which an iterating value is updated through addition. 
         * It must be a negative or positive non-zero value. Does not accept chaining expressions.
         * 
         * **maps:**`loop.for.updateBy`
         */
        for(start:Field<number>,end:Field<number>,step:Field<number>=1){
            this._.loop={start,end,step}
            return this
        }
        /**
         * **required:false**
         * @param name User-defined name for the step
         * 
         * **maps:**`name`
         */
        name(name:Field<string>){
            this._.name=name
            return this
        }
        /**
         * **required:false**
         * @param action Specifies what the step should do in case of failure: abort or 
         * continue to the next step.
         * 
         * **maps:**`onFailure`
         */
        onFailure(action:Field<"Abort"|"Continue">){
            this._.onFailure=action
            return this
        }
        /**
         * **required:false**
         * @param num Maximum number of attempts allowed before failing the step.
         * 
         * **maps:**`maxAttempts`
         */
        maxAttempts(num:Field<number>){
            this._.maxAttempts=num
            return this
        }
        /**
         * **required:false**
         * @param sec Number of seconds that the step runs before failing or retrying.
         * 
         * Also, supports -1 value, which indicates infinite timeout. 0 and other negative 
         * values are not allowed.
         * 
         * **maps:**`timeoutSeconds`
         */
        timeout(sec:Field<number>){
            this._.timeout=sec
            return this
        }
        [toJson]() {
            return {
                action:this._.action,
                name:this._.name,
                input:this.genInput(),
                timeoutSeconds:this._.timeout,
                onFailure:this._.onFailure,
                maxAttempts:this._.maxAttempts,
                loop:this._.loop && {
                    name:this._.loopName,
                    for: "start" in this._.loop
                        ? {
                            start:this._.loop.start,
                            end:this._.loop.end,
                            updateBy:this._.loop.step
                        } 
                        : undefined ,
                    forEach: "delimiter" in this._.loop
                        ? {
                            list:this._.loop.string,
                            delimiter:this._.loop.delimiter
                        }
                        : "items" in this._.loop 
                            ? this._.loop.items
                            : undefined
                }
            }
        }
        protected abstract genInput():Inp;
        [prepareQueue](stack: stackPreparable, path: pathItem, ref: boolean): void {
            callOnPrepareQueue(this._,stack,path,true)
            if(!this._.name){
                if(path instanceof PathDataCarrier && path.data.index!==undefined){
                    this._.name=Sub`${this._.action}${path.data.index}`
                }else {
                    throw new PreparableError(this,"you must specify a name")
                }
            }
        }
        constructor(){
            super(2)
        }

    }
    /**
     * The S3Upload action module allows you to upload a file from a source file/folder 
     * to an Amazon S3 location. Wildcards are permitted for use with the source and are 
     * denoted by the character *. If the specified destination object already exists in 
     * the target Amazon S3 bucket, S3Upload overwrites the object.
     * 
     * If the recursive S3Upload action fails, Amazon S3 files that have already been 
     * uploaded will remain.
     * 
     * ### Supported use cases:
     * 
     * - Local file to S3 object.
     * - Local files in folder (with wildcard) to S3 KeyPrefix.
     * - Copy local folder (must have recurse set to true) to S3 KeyPrefix.
     * 
     * ### IAM requirements
     * 
     * The IAM role that you associate with your instance profile must have permissions to 
     * run the S3Upload action module. The following IAM role policy must be attached to the 
     * IAM role that is associated with the instance profile: s3:PutObject against the 
     * bucket/object (for example, arn:aws:s3:::BucketName/*).
     */
    export class S3Upload extends BaseStep<StepOut.S3Upload["inputs"]>{
        readonly [resourceIdentifier]="Step.S3Upload";
        protected _:BaseStep<any>["_"] & {
            transf:{
                from:Field<string>
                to:Field<string>
                rec?:Field<boolean>
            }[]
        }={
            action:"S3Upload",
            transf:[]
        } as any
        constructor()
        /**
         * @param from Local path. Source supports wildcard denoted by a *
         * 
         * **maps:**`inputs[].source`
         * @param to Remote path
         * 
         * **maps:**`inputs[].destination`
         * @param rec When set to true, performs S3Upload recursively.
         * 
         * **maps:**`inputs[].recurse`
         */
        constructor(from:Field<string>,to:Field<string>,rec?:Field<boolean>)
        constructor(from?:Field<string>,to?:Field<string>,rec?:Field<boolean>){
            super()
            if(from){
                this.Transfer(from,to,rec)
            }
        }
        /**
         * **required:true**
         * @param from Local path. Source supports wildcard denoted by a *
         * 
         * **maps:**`inputs[].source`
         * @param to Remote path
         * 
         * **maps:**`inputs[].destination`
         * @param rec When set to true, performs S3Upload recursively.
         * 
         * **maps:**`inputs[].recurse`
         */
        Transfer(from:Field<string>,to:Field<string>,rec?:Field<boolean>){
            this._.transf.push({ from,to,rec })
            return this
        }
        protected genInput() {
            return this._.transf.map(v=>({
                source:v.from,
                destination:v.to,
                recurse:v.rec
            }))
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            const errors:string[]=[]
            if(!this._.transf.length){
                errors.push("you must specify at least one transfer")
            }
            const out:SMap<ResourceError>={}
            if(errors.length){
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors
                }
            }
            return this[checkCache]=callOnCheckValid(this._,out)
        }

    }
    /**
     * The S3Download action module allows you to download an Amazon S3object or a set of Amazon 
     * S3 objects from a KeyPrefix to a local destination path. The destination path can be a file 
     * or folder. If the specified destination file already exists on the local system, S3Download 
     * overwrites the file.
     * 
     * If the S3Download action for S3KeyPrefix fails, the state of the destination folder remains 
     * as it is upon failure. The folder contents are not rolled back to the contents before failure.
     * 
     * ### Supported use cases:
     * - S3 object to local file.
     * - S3 objects (with KeyPrefix in an Amazon S3 file path) to local folder, which recursively 
     *   copies all Amazon S3 files in a KeyPrefix to the local folder.
     * 
     * ### IAM requirements
     * The IAM role that you associate with your instance profile must have permissions to run the 
     * S3Download action module. The following IAM role policies must be attached to the IAM role that 
     * is associated with the instance profile:
     * - Single file: s3:GetObject against the bucket/object (for example, arn:aws:s3:::BucketName/*).
     * - Multiple files: s3:ListBucket against the bucket/object (for example, arn:aws:s3:::BucketName) and s3:GetObject against the bucket/object (for example, arn:aws:s3:::BucketName/*).
     */
    export class S3Download extends BaseStep<StepOut.S3Download["inputs"]>{
        readonly [resourceIdentifier]="Step.S3Download";
        protected _:BaseStep<any>["_"] & {
            transf:{
                from:Field<string>
                to:Field<string>
            }[]
        }={
            action:"S3Download",
            transf:[]
        } as any
        constructor()
        /**
         * @param from Remote path. Source supports wildcard denoted by a *.
         * 
         * **maps:**`inputs[].source`
         * @param to Local path.
         * 
         * **maps:**`inputs[].destination`
         */
        constructor(from:Field<string>,to:Field<string>)
        constructor(from?:Field<string>,to?:Field<string>){
            super()
            if(from){
                this.Transfer(from,to)
            }
        }
        /**
         * **required:false**
         * @param from Remote path. Source supports wildcard denoted by a *.
         * 
         * **maps:**`inputs[].source`
         * @param to Local path.
         * 
         * **maps:**`inputs[].destination`
         */
        Transfer(from:Field<string>,to:Field<string>){
            this._.transf.push({ from,to })
            return this
        }
        protected genInput() {
            return this._.transf.map(v=>({
                source:v.from,
                destination:v.to,
            }))
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            const errors:string[]=[]
            if(!this._.transf.length){
                errors.push("you must specify at least one transfer")
            }
            const out:SMap<ResourceError>={}
            if(errors.length){
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors
                }
            }
            return this[checkCache]=callOnCheckValid(this._,out)
        }

    }
    /**
     * ### Binary
     * The ExecuteBinary module allows you to run binary files with a list of command-line arguments.
     * 
     * The ExecuteBinary module handles system restarts if the run finishes with an exit code of
     * 194 (Linux) or 3010 (Windows). When triggered, the application performs one of the following actions:
     * - The application hands the exit code to the caller if it is executed by the SSM Agent.
     *   The SSM Agent handles the system restart and re-invokes the execution as described in
     *   Rebooting Managed Instance from Scripts.
     * - The application saves the current executionstate, configures a restart initiation to
     *   rerun the application, and restarts the system.
     * 
     * After the system restarts, the application runs the same step that initiated the
     * restart. If you require this functionality, you must write idempotent scripts that can
     * handle multiple invocations of the same shell command.
     * 
     * ### Bash
     * The ExecuteBash module allows you to run bash scripts with inline shell code/commands.
     * This module supports Linux.
     * 
     * All of the commands and instructions that you specify in the commands block are converted
     * into a file (for example, input.sh) and run by using the bash shell. The result of
     * running shell file is the exit code of the step.
     * 
     * The ExecuteBash module handles system restarts if the run finishes with an exit code of
     * 194. When initiated, the application performs one of the following actions:
     * - The application hands the exit code to the caller if it is run by the SSM Agent. The SSM
     *   Agent handles the system restart and re-invokes the execution as described in Rebooting
     *   Managed Instance from Scripts.
     * - The application saves the current executionstate, configures a restart initiation to
     *   rerun the application, and restarts the system.
     * 
     * After the system restarts, the application runs the same step that initiated the restart.
     * If you require this functionality, you must write idempotent scripts that can handle
     * multiple invocations of the same shell command.
     * ### PowerShell
     * The ExecutePowerShell module allows you to run PowerShell scripts with inline shell
     * code/commands. This module supports the Windows platform and Windows PowerShell.
     * 
     * All of the commands/instructions specified in the commands block are converted
     * into a script file (for example, input.ps1) and run by using Windows PowerShell. The
     * result of the shell file execution is the exit code.
     * 
     * The ExecutePowerShell module handles system restarts if the shell command exits with an
     * exit code of 3010. When initiated, the application performs one of the following actions:
     * 
     * - Hands the exit code to the caller if run by the SSM Agent. The SSM Agent handles the
     *   system restart and re-invokes the execution as described in Rebooting Managed Instance
     *   from Scripts.
     * 
     * - Saves the current executionstate, configures a restart initiation to rerun the
     *   application, and restarts the system.
     * 
     * After the system restarts, the application runs the same step that initiated the restart.
     * If you require this functionality, you must write idempotent scripts that can handle
     * multiple invocations of the same shell command.
     */
    export class Execute extends BaseStep<(StepOut.ExecuteBash|StepOut.ExecutePowerShell|StepOut.ExecuteBinary)["inputs"]>{
        [resourceIdentifier]="Step.Execute";
        protected _:BaseStep<any>["_"] & {
            type:Field<"PowerShell"|"Bash">|"Binary"
            file:Field<string>
            args:Field<string>[]
            commands:Field<string>[]
        }={
            get action(){
                if(this.file && this.type=="Bash"){
                    return "ExecuteBinary"
                }
                return Sub`Execute${this.type}`
            }
        } as any
        /**
         * @param type if this is a PowerShell Bash or Binary Execution
         * @param file The path to the binary file for running.
         * @param args Contains a list of command-line arguments to use when running the binary.	
         */
        constructor(type:"Binary",file:Field<string>,...args:Field<string>[])
        /**
         * @param type if this is a PowerShell Bash or Binary Execution
         * @param file Contains the path to a PowerShell or bash script file. PowerShell will run against this file using the -file command line argument. The path must point to a .ps1 or .sh file.
         */
        constructor(type:"PowerShell"|"Bash",file:Field<string>)
        /**
         * @param type if this is a PowerShell Bash or Binary Execution
         * @param commands Contains a list of instructions or commands to run, according to bash syntax. Multi-line YAML is allowed.	
         */
        constructor(type:Field<"PowerShell"|"Bash">,commands:Field<string>[])
        constructor(type:Field<"PowerShell"|"Bash">|"Binary",commands:Field<string>[]|Field<string>,...args:Field<string>[]){
            super()
            this._.type=type
            if(commands instanceof Array){
                this._.commands=commands
            }else{
                this._.file=commands
                this._.args=args
            }
        }
        protected genInput(): { commands: Field<string>[]; } | { file: Field<string>; } | { path: Field<string>; arguments?: Field<string>[]; } {
            if(this._.type=="Binary"){
                return {
                    path:this._.file,
                    arguments:notEmpty(this._.args)
                }
            }else if(this._.commands){
                return {
                    commands:this._.commands
                }
            }else if(this._.file){
                if(this._.type=="Bash"){
                    return {
                        path:"/bin/bash",
                        arguments:[
                            this._.file
                        ]
                    }
                }else{
                    return {
                        file:this._.file
                    }
                }
            }
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            return this[checkCache]=callOnCheckValid(this._,{})
        }

    }
    /**
     * The Reboot action module restarts the instance. It has a configurable option to delay the 
     * restart. It does not support the step timeout value because of the instance getting 
     * restarted. Default behavior is that delaySeconds is 0, which means that there is no delay.
     * 
     * If the application is invoked by the SSM Agent, it hands the exit code (3010 for Windows,
     * 194 for Linux) to the SSM Agent. The SSM Agent handles the system restart as described in
     * Rebooting Managed Instance from Scripts.
     * 
     * If the application is invoked on the host as a standalone process, it saves the current
     * run state, configures a post-reboot auto-run trigger to rerun the application, and then
     * restarts the system.
     * 
     * Post-reboot auto-run trigger:
     * 
     * Windows. Create a Task Scheduler entry with a trigger at SystemStartup
     * 
     * Linux. Add a job in crontab.
     * 
     * `@reboot /download/path/awstoe run --document s3://bucket/key/doc.yaml`
     * This trigger is cleaned up when the application starts.
     * 
     * To use the Reboot action module, for steps that contain reboot exitcode (for example,
     * 3010), you must run the application binary as sudo user.
     */
    export class Reboot extends BaseStep<StepOut.Reboot["inputs"]>{
        readonly [resourceIdentifier]="Step.Reboot";
        protected _:BaseStep<any>["_"] & {
            delay:Field<number>
        }={
            action:"Reboot"
        } as any
        /**
         * @param delayS Delays a specific amount of time before initiating a restart.	
         */
        constructor(delayS?:Field<number>){
            super()
            this._.delay=delayS
        }
        protected genInput() {
            return {
                delaySeconds:this._.delay
            }
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            return this[checkCache]=callOnCheckValid(this._,{})
        }

    }
    /**
     * The UpdateOS action module adds support for installing Windows and Linux updates.
     * 
     * The UpdateOS action module installs all available updates by default. You can 
     * override this action by providing a list of one or more updates to include for 
     * installation, a list of one or more updates to exclude from installation, or both.
     * 
     * If both “include" and "exclude" lists are provided, the resulting list of updates 
     * can include only those listed in the "include" list that are not listed in the 
     * "exclude" list.
     * - Windows. Updates are installed from the update source configured on the target machine.
     * - Linux. The application checks for the supported package manager in the Linux platform and uses either yum or apt-get package manager. If neither is supported, an error is returned. You should have sudo permissions to run the UpdateOS action module. If you do not have sudo permissions an error.Input is returned.
     */
    export class UpdateOS extends BaseStep<StepOut.UpdateOS["inputs"]>{
        readonly [resourceIdentifier]="Step.UpdateOS";
        protected _:BaseStep<any>["_"] & {
            include:Field<string>[]
            exclude:Field<string>[]
        }={
            action:"UpdateOS",
            include:[],
            exclude:[]
        } as any
        constructor(){
            super()
        }
        /**
         * **required:false**
         * @param packages For Windows, you can specify the following:
         * - One or more Microsoft Knowledge Base (KB) article IDs to include in the list 
         *   of updates that may be installed. Valid formats are KB1234567 or 1234567.
         * - An update name using a wildcard value (*). Valid formats are `Security*` or 
         *   `*Security*`.
         *     
         * For Linux, you can specify one or more packages to be included in the list for
         * installation.
         */
        include(...packages:Field<string>[]){
            this._.include.push(...packages)
            return this
        }
        /**
         * **required:false**
         * @param packages For Windows, you can specify the following:
         * 
         * - One or more Microsoft Knowledge Base (KB) article IDs to include in the list of 
         *   updates to be excluded from the installation. Valid formats are KB1234567 or 1234567.
         * - An update name using a wildcard (*) value. Valid formats are: `Security*` or `*Security*`.
         * 
         * For Linux, you can specify one or more packages to be excluded from the installation.
         */
        exclude(...packages:Field<string>[]){
            this._.exclude.push(...packages)
            return this
        }
        protected genInput() {
            return {
                include:notEmpty(this._.include),
                exclude:notEmpty(this._.exclude)
            }
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            return this[checkCache]=callOnCheckValid(this._,{})
        }

    }
    /**
     * The SetRegistry action module accepts a list of inputs and allows you to set 
     * the value for the specified registry key. If a registry key does not exist, 
     * it is created in the defined path. This feature applies only to Windows.
     */
    export class SetRegistry extends BaseStep<StepOut.SetRegistry["inputs"]>{
        readonly [resourceIdentifier]="Step.SetRegistry";
        protected _:BaseStep<any>["_"] & {
            actions:{
                path:Field<string>,
                name:Field<string>,
                value:Field<string|number>|Field<string|number>[],
                type:Field<string>,
            }[]
        }={
            action:"SetRegistry",
            actions:[]
        } as any
        constructor()
        /**
         * @param path Path of the registry key.
         * 
         * **maps:**`inputs[].path`
         * @param name Name of the registry key.
         * 
         * **maps:**`inputs[].name`
         * @param type Value type of the registry key.
         * 
         * **maps:**`inputs[].type`
         * @param value Value of the registry key.
         * 
         * **maps:**`inputs[].value`
         */
        constructor(path:Field<string>,name:Field<string>,type:Field<RegistryType>,value:Field<string|number>|Field<string|number>[])
        constructor(path?:Field<string>,name?:Field<string>,type?:Field<RegistryType>,value?:Field<string|number>|Field<string|number>[]){
            super()
            if(path){
                this.Set(path,name,type,value)
            }
        }
        /**
         * **required:true**
         * @param path Path of the registry key.
         * ### Supported path prefixes
         * - HKEY_CLASSES_ROOT / HKCR:
         * - HKEY_USERS / HKU:
         * - HKEY_LOCAL_MACHINE / HKLM:
         * - HKEY_CURRENT_CONFIG / HKCC:
         * - HKEY_CURRENT_USER / HKCU:
         * 
         * **maps:**`inputs[].path`
         * @param name Name of the registry key.
         * 
         * **maps:**`inputs[].name`
         * @param type Value type of the registry key.
         * 
         * **maps:**`inputs[].type`
         * @param value Value of the registry key.
         * 
         * **maps:**`inputs[].value`
         */
        Set(path:Field<string>,name:Field<string>,type:Field<RegistryType>,value:Field<string|number>|Field<string|number>[]){
            this._.actions.push({ path,name,type,value })
            return this
        }
        protected genInput() {
            return this._.actions
        }
        [checkValid](): SMap<ResourceError> {
            if(this[checkCache]) return this[checkCache];
            const errors:string[]=[]
            if(!this._.actions.length){
                errors.push("you must specify at least one transfer")
            }
            const out:SMap<ResourceError>={}
            if(errors.length){
                out[this[stacktrace]]={
                    type:this[resourceIdentifier],
                    errors
                }
            }
            return this[checkCache]=callOnCheckValid(this._,out)
        }

    }
}
