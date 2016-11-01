import { Type, OpaqueToken } from '@angular/core';

export abstract class SBConfig {
    token?: string;
    map?: {
        [key: string]: Type<any>
    } 
}


export const SB_CONFIG = new OpaqueToken('SB_CONFIG');