/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBStory } from './model';
import { SBAdapter } from './adapter';
import { SBSerializer } from './serializer';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export abstract class SBStore {
  /**
   * Use `findStory` to retrieve a story by its slug.
   * This will return an Observable that fulfills with the requested record.
   * 
   * @abstract
   * @param {string} slug
   * @param {string} [version]
   * @returns {Observable<SBStory>}
   * 
   * @memberOf SBStore
   */
  abstract findStory(slug: string, version?: string): Observable<SBStory>;
  /**
   * Use `findStory` to retrieve a story by its id.
   * This will return an Observable that fulfills with the requested record.
   * 
   * @abstract
   * @param {number} id
   * @param {string} [version]
   * @returns {Observable<SBStory>}
   * 
   * @memberOf SBStore
   */
  abstract findStory(id: number, version?: string): Observable<SBStory>;
  /**
   * Use `peekStory` to retrieve a story by its slug, without making a network request.
   * This will return the story only if it is already present in the store.
   * 
   * @abstract
   * @param {string} slug
   * @param {string} [version]
   * @returns {SBStory}
   * 
   * @memberOf SBStore
   */
  abstract peekStory(slug: string, version?: string): SBStory;
  /**
   * Use `peekStory` to retrieve a story by its slug, without making a network request.
   * This will return the story only if it is already present in the store.
   * 
   * @abstract
   * @param {number} id
   * @param {string} [version]
   * @returns {SBStory}
   * 
   * @memberOf SBStore
   */
  abstract peekStory(id: number, version?: string): SBStory;
}

@Injectable()
export class SBDefaultStore implements SBStore {

  private _stories = new Map<number | string, { story: SBStory }>();

  constructor(private _adapter: SBAdapter, private _serializer: SBSerializer) { }

  findStory(slug: string, version?: string): Observable<SBStory>;
  findStory(id: number, version?: string): Observable<SBStory>;
  findStory(slugOrId: string | number, version?: string): Observable<SBStory> {
    return this._adapter.loadStory(<any>slugOrId).map(data => {
      const story = this._serializer.normalizeStory(data);
      const obj = { story: story };
      this._stories.set(story.id, obj);
      this._stories.set(story.slug, obj);
      return story;
    })
  }

  peekStory(slug: string, version?: string): SBStory;
  peekStory(id: number, version?: string): SBStory;
  peekStory(slugOrId: string | number, version?: string): SBStory {
    const result = this._stories.get(slugOrId);
    return result && result.story ? result.story : null;
  }

}