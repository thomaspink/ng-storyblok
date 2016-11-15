/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBStory, SBComponent, SBBlok } from './model';

/**
 * Normally, the store will use the serializer to convert a json or string
 * payload into a normalize form or a higher level structure into a json or
 * string by serializing.
 * 
 * When creating your own serializer, the minimum set of methods that you should implement is:
 * `normalizeStory`, `normalizeComponent` and `normalizeBlok`.
 * 
 * @export
 * @abstract
 * @class SBSerializer
 */
@Injectable()
export abstract class SBSerializer {
  /**
   * Converts a json or string story payload into the normalized form and creates an SBStory class.
   * 
   * @param {(string | Object)} payload
   * @returns {SBStory}
   * 
   * @memberOf SBSerializer
   */
  abstract normalizeStory(payload: string | Object): SBStory;

  /**
   * Converts a json or string component payload into the normalized form and creates an SBComponent class.
   * 
   * @param {(string | Object)} payload
   * @returns {SBComponent}
   * 
   * @memberOf SBSerializer
   */
  abstract normalizeComponent(payload: string | Object): SBComponent;

  /**
   * Converts a json or string blok payload into the normalized form and creates an SBBlok class.
   * 
   * @param {(string | { _uid: string; component: string;[key: string]: any }[])} payload
   * @returns {SBBlok}
   * 
   * @memberOf SBSerializer
   */
  abstract normalizeBlok(payload: string | { _uid: string; component: string;[key: string]: any }[]): SBBlok;
}

@Injectable()
export class SBDefaultSerializer implements SBSerializer {

  /* @override */  
  normalizeStory(payload: string | Object) {
    const data: any = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const story = data.story || data;

    if (!this._isStory(story)) {
      throw new Error(`Could not normalize story.`)
    }

    return new SBStory({
      id: parseInt(story.id, 10),
      name: story.name + '',
      slug: story.slug + '',
      fullSlug: story.full_slug + '',
      created: new Date(story.created_at),
      published: new Date(story.published_at),
      alternates: story.alternates || [],
      sortByDate: story.sort_by_date || null,
      tagList: story.tag_list || [],
      content: this.normalizeComponent(story.content) || null,
      editable: story._editable
    });

  }

  /* @override */  
  normalizeComponent(payload: string | Object): SBComponent {
    const data: any = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!this._isComponent) {
      throw new Error('Could not normalize storyblok component');
    }

    const properties = {};
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (key !== '_uid' && key !== 'component') {
          const value = data[key];
          if (this._isBlock(value)) {
            properties[key] = this.normalizeBlok(value);
          } else {
            properties[key] = data[key];
          }
        }
      }
    }

    return new SBComponent({
      _uid: data._uid + '',
      type: data.component + '',
      model: properties
    })
  }

  /* @override */  
  normalizeBlok(payload: string | { _uid: string; component: string;[key: string]: any }[]) {
    const data: { _uid: string; component: string;[key: string]: any }[]
      = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!this._isBlock(data)) {
      throw new Error(`Could not normalize Blok`);
    }
    return new SBBlok(data.map(c => this.normalizeComponent(c)))
  }

  /* @internal */ 
  private _isStory(payload: { id: number }) {
    return typeof payload.id === 'number';
  }

  /* @internal */ 
  private _isComponent(payload: { _uid: string; component: string;[key: string]: any }) {
    return typeof payload === 'object' && !Array.isArray(payload) &&
      typeof payload._uid === 'string' && typeof payload.component === 'string';
  }

  /* @internal */ 
  private _isBlock(payload: { _uid: string; component: string;[key: string]: any }[]) {
    return Array.isArray(payload) && payload.filter(c => this._isComponent(c)).length === payload.length;
  }
}