/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SBStorySchema } from './schema';
import { SBConfig } from '../config';

@Injectable()
export abstract class SBAdapter {
  /**
   * This method will fetch a story by it's slug or id from storyblok and return a Promise
   * that will be resolved with the story's raw data.
   *
   * @param {(string | number)} slugOrId
   * @param {string} [version]
   * @returns {Promise<SBStorySchema>}
   *
   * @memberOf SBAdapter
   */
  abstract fetchStory(slugOrId: string | number, version?: string): Promise<SBStorySchema>;

  /**
   * This method will fetch a whole collection of stories by it's path and return a Promise
   * that will be resolved with the collection.
   *
   * @param {string} path
   * @returns {Promise<SBStorySchema[]>}
   *
   * @memberOf SBAdapter
   */
  abstract fetchCollection(path: string): Promise<SBStorySchema[]>;

}

/* @internal */
export class SBBaseAdapter {
  private _pending: {
    [key: string]: { resolve: (s: any) => void, reject: (error: any) => void }[] } = {};

  /* @internal */
  protected _addPending(key: string, resolve: (s: any) => void,
      reject: (error: any) => void = () => undefined) {
    if (!Array.isArray(this._pending[key])) {
      this._pending[key] = [{resolve: resolve, reject: reject}];
    } else {
      this._pending[key].push({resolve: resolve, reject: reject});
    }
  }

  /* @internal */
  protected _hasPending(key: string) {
    const pending = this._pending[key];
    return Array.isArray(pending) && pending.length;
  }

  /* @internal */
  protected _resolvePending(key: string, payload: any) {
    const pending = this._pending[key];
    if (Array.isArray(pending)) {
      pending.forEach(p => p.resolve(payload));
    }
    this._pending[key] = undefined;
  }

  /* @internal */
  protected _rejectPending(key: string, error: any) {
    const pending = this._pending[key];
    if (Array.isArray(pending)) {
      pending.forEach(p => p.reject(error));
    }
    this._pending[key] = undefined;
  }
}

@Injectable()
export class SBHttpAdapter extends SBBaseAdapter implements SBAdapter  {

  private _host = 'https://api.storyblok.com/v1/cdn';

  constructor(private _http: Http, private _config: SBConfig) { super(); }

  /* @override */
  fetchStory(slugOrId: string | number, version?: string): Promise<SBStorySchema> {
    if (typeof slugOrId !== 'number' && typeof slugOrId !== 'string')
      throw new TypeError(
        `You have to provide the slug(string) or the id(number) as the first parameter!`);
    if (typeof version !== 'string' && typeof version !== 'undefined')
      throw new TypeError('The version parameter for `fetchStory` has to be a string!');

    return new Promise((resolve, reject) => {
      const key = 'story#' + slugOrId;
      if (!this._hasPending(key))
        this._http.get(`${this._host}/stories/${slugOrId}` +
        `?token=${this._config.accessToken}&t=${Date.now()}`)
          .subscribe(
            response => {
              const body = response.json();
              if (body)
                this._resolvePending(key, body);
              else
                this._rejectPending(key, 'Could not load Story. Response body is empty!');
          }, error => {
            this._rejectPending(key, error);
          });
      this._addPending(key, resolve, reject);
    });
  }

  /* @override */
  fetchCollection(path: string): Promise<SBStorySchema[]> {
    if (typeof path !== 'string')
      throw new TypeError(`No valid path provided to fetchCollection method`);

    return new Promise((resolve, reject) => {
    const key = 'collection#' + path;
    if (!this._hasPending(key))
      this._http.get(`${this._host}/stories/` +
      `?token=${this._config.accessToken}&starts_with=${path}&t=${Date.now()}`)
        .subscribe(
          response => {
              const body = response.json();
              if (body && body.stories)
                this._resolvePending(key, body.stories);
              else
                this._rejectPending(key, 'Could not load Collection. Response body is empty!');
            }, error => this._rejectPending(key, error));
      this._addPending(key, resolve, reject);
    });
  }
}
