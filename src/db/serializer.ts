/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBStory, SBComponent } from './model';
import { SBComponentSchema, SBStorySchema } from './schema';

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
   * @param {(string | SBStorySchema)} payload
   * @returns {SBStory}
   *
   * @memberOf SBSerializer
   */
  abstract normalizeStory(payload: string | SBStorySchema): SBStory;

  /**
   * Converts a json or string component payload into the normalized form
   * and creates an SBComponent class.
   *
   * @param {(string | SBComponentSchema)} payload
   * @returns {SBComponent}
   *
   * @memberOf SBSerializer
   */
  abstract normalizeComponent(payload: string | SBComponentSchema): SBComponent;

  /**
   * Converts a json or string blok payload into the normalized form
   * and creates an array of SBComponent classes.
   *
   * @param {(string | SBComponentSchema[])} payload
   * @returns {SBComponent[]}
   *
   * @memberOf SBSerializer
   */
  abstract normalizeBlok(payload: string | SBComponentSchema[]): SBComponent[];

  /**
   * Converts a json or string blok payload into the normalized form
   * and creates an array of SBStory.
   *
   * @param {(string | {}[])} payload
   * @returns {SBStory[]}
   *
   * @memberOf SBSerializer
   */
  abstract normalizeCollection(payload: string | SBStorySchema[]): SBStory[];
}

@Injectable()
export class SBDefaultSerializer implements SBSerializer {

  /* @override */
  normalizeStory(payload: string | SBStorySchema) {
    const data: any = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const story = data.story || data;

    if (!this._isStory(story)) {
      throw new Error(`Could not normalize story.
        The provided payload does not math the story schema.`);
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
  normalizeComponent(payload: string | SBComponentSchema): SBComponent {
    const data: any = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!this._isComponent(data)) {
      throw new Error(`Could not normalize storyblok component.
        The provided payload does not math the component schema.`);
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
    });
  }

  /* @override */
  normalizeBlok(payload: string | SBComponentSchema[]) {
    const data: SBComponentSchema[]
      = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!this._isBlock(data)) {
      throw new Error(`Could not normalize Blok.
        The provided payload does not math the story block.`);
    }
    return data.map(c => this.normalizeComponent(c));
  }

  /* @override */
  normalizeCollection(payload: string | SBStorySchema[]) {
    const data: SBStorySchema[] = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!this._isCollection(data)) {
      throw new Error(`Could not normalize Collection.
        The provided payload does not math the collection schema.`);
    }
    return data.map(s => this.normalizeStory(s));
  }

  /* @internal */
  private _isStory(payload: SBStorySchema) {
    return typeof payload.id === 'number' && typeof payload.name === 'string' &&
      !!payload.name.length && typeof payload.slug === 'string' && !!payload.slug.length &&
      this._isComponent(payload.content);
  }

  /* @internal */
  private _isComponent(payload: SBComponentSchema) {
    return typeof payload === 'object' && !Array.isArray(payload) &&
      typeof payload._uid === 'string' && typeof payload.component === 'string';
  }

  /* @internal */
  private _isBlock(payload: SBComponentSchema[]) {
    return Array.isArray(payload) &&
      payload.filter(c => this._isComponent(c)).length === payload.length;
  }

  /* @internal */
  private _isCollection(payload: SBStorySchema[]) {
    return Array.isArray(payload) &&
      payload.filter(c => this._isStory(c)).length === payload.length;
  }
}
