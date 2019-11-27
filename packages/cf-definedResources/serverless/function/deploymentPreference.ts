import { Field, InlineAdvField } from "aws-cf-builder-core/field";

export interface DeploymentPreferenceOut{
    Alarms:Field<string>[]
    Enabled:Field<boolean>
    Hooks:{
        PostTraffic:Field<string>
        PreTraffic:Field<string>
    }
    Role:Field<string>
    Type:Field<"Linear"|"Canary">
}
//TODO export class DeploymentPreference extends InlineAdvField<DeploymentPreferenceOut>{}
