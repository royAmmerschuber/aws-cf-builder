import { pathItem } from "./path";

export class refPlaceholder<T>{
    constructor(
        public ref:T,
        public path:pathItem
    ){}
}