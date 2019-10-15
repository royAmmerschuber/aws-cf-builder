import { pathItem } from "./general";

export class refPlaceholder<T>{
    constructor(
        public ref:T,
        public path:pathItem
    ){}
}