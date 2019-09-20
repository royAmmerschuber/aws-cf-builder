import { CustomProvider, customProvider } from "./provider";

export function Custom(name:string):CustomProvider{
    return new customProvider(name) as any
}

export { CustomProvider } from "./provider"