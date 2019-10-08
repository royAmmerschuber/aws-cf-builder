import { Module } from "./module";

import { ReferenceField, Field } from "./field";
import { SMap } from "./general";
import { output } from "./output";
import { variable } from "./variable";

export type RefFilterByOutput<T>=FilterByObjects.RemoveNevers<{
    [K in keyof T]:T[K] extends output<any>
        ? T[K] extends output<infer P> ? ReferenceField<P> : never
        : T[K] extends SMap<any>
            ? FilterByObjects.EmptyToNever<RefFilterByOutput<T[K]>>
            : never 
}>
export type FilterInputToSetter<T,This>=FilterByObjects.RemoveNevers<{
    [K in keyof T]:T[K] extends variable<any>
        ? T[K] extends variable<infer P> ? (val:Field<P>)=>Module<This> : never
        : T[K] extends SMap<any>
            ? FilterByObjects.EmptyToNever<FilterInputToSetter<T[K],This>>
            : never 
}>
/* type FilterByObjects<T,comp>=FilterByObjects.RemoveNevers<{
    [K in keyof T]:T[K] extends comp
        ? T[K]
        : T[K] extends SMap<any>
            ? FilterByObjects.EmptyToNever<FilterByObjects<T[K],comp>>
            : never 
}> */
namespace FilterByObjects{
    export type RemNeverKeys<T> = {
        [K in keyof T]: T[K] extends never
            ? never
            : K
    } extends {[_ in keyof T]: infer U} 
        ? U 
        : never ;
    //@ts-ignore
    export type RemoveNevers<T>=Pick<T,RemNeverKeys<T>>
    export type EmptyToNever<T>={} extends T ? never : T
}