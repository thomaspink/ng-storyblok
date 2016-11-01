/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

export interface SBComponentSchema {
    _uid: string;
    component: string;
    [key: string]: any;
}

export class SBComponent {
    constructor(public _uid: string, public type: string, public data: { [key: string]: any } = {}) { }
}

export function componentFromSchema(schema: SBComponentSchema): SBComponent {
    if (!schema._uid || !schema.component) {
        throw new Error(`The provided object does not implement the storyblok component interface ("_uid" or "component" property missing)`);
    }
    const data = {};
    for (let key in schema) {
        if (schema.hasOwnProperty(key)) {
            if (key !== '_uid' && key !== 'component') {
                data[key] = schema[key];
            }
        }
    }
    return new SBComponent(schema._uid, schema.component, data);
}