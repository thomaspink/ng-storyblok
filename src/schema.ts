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