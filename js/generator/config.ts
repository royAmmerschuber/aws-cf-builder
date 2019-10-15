import { SMap } from "../general/general";

export interface GroupConfig {
    resources:SMap<ConfigGeneratable>
    datasources:SMap<ConfigGeneratable>
}
export interface ConfigGeneratable{
    alias?:string
    nameParts?:string[]
    childResources?:SMap<string[]>
    provides?:boolean
    inherits?:SMap<{resource:string,attribute:string}>
}
export interface ProviderConfig{

}
export interface InheritedProperty {
    resource:string
    attribute:string
}