import { Preparable, Generatable } from "./general";

export type Field<T> = T | AdvField<T>
export interface AdvField<T> extends Preparable {
    toJSON(): any
}
export function isAdvField(prep: any): prep is AdvField<any> {
    return (
        prep instanceof GeneratableAdvField ||
        prep instanceof InlineAdvField
    )
}
export abstract class GeneratableAdvField<T> extends Generatable implements AdvField<T>{
    abstract toJSON(): any
}
export abstract class InlineAdvField<T> extends Preparable implements AdvField<T>{
    abstract toJSON(): any
}