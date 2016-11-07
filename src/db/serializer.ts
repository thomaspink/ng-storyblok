/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBStory, SBComponent, SBBlok } from './model';

@Injectable()
export abstract class SBSerializer {
  abstract normalizeStory(payload: string | Object): SBStory;
  abstract normalizeComponent(payload: string | Object): SBComponent;
}

@Injectable()
export class SBDefaultSerializer implements SBSerializer {

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

  normalizeBlok(payload: string | { _uid: string; component: string;[key: string]: any }[]) {
    const data: { _uid: string; component: string;[key: string]: any }[]
      = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!this._isBlock(data)) {
      throw new Error(`Could not normalize Blok`);
    }
    return new SBBlok(data.map(c => this.normalizeComponent(c)))
  }

  private _isStory(payload: { id: number }) {
    return typeof payload.id === 'number';
  }

  private _isComponent(payload: { _uid: string; component: string;[key: string]: any }) {
    return typeof payload === 'object' && !Array.isArray(payload) &&
      typeof payload._uid === 'string' && typeof payload.component === 'string';
  }

  private _isBlock(payload: { _uid: string; component: string;[key: string]: any }[]) {
    return Array.isArray(payload) && payload.filter(c => this._isComponent(c)).length === payload.length;
  }
}