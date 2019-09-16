class module{
    constructor(file:any){

    }
}
export function Module(file:any){
    return new module(file)
}
export type Module=module
