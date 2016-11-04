/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBSerializer } from './serializer';
import { StoryblokRef } from '../sdk';
import { Observable } from 'rxjs/Rx';
import { fromPromise } from 'rxjs/observable/fromPromise';
import 'rxjs/add/operator/map';


@Injectable()
export abstract class SBAdapter {
  abstract loadStoryBySlug(slug: string, version?: string): Observable<any>;
  abstract loadStoryById(id: string, version?: string): Observable<any>;

  abstract getStoryBySlug(slug: string, version?: string): void;
  abstract getStoryById(id: string, version?: string): void;
}

@Injectable()
export class SBSdkAdapter implements SBAdapter {
  constructor(private _serializer: SBSerializer, private _sdk: StoryblokRef) { }

  loadStoryBySlug(slug: string, version?: string) {
    return fromPromise(this._sdk.get({ slug: slug, version: version })).map((data) => {
      return this._serializer.normalizeStory(data);
    });
  }

  loadStoryById(id: string, version?: string) {
    return this.loadStoryBySlug(id, version);
  }

  getStoryBySlug(slug: string, version?: string): void {
    throw new Error('Not yet implemented');
  }

  getStoryById(id: string, version?: string): void {
    throw new Error('Not yet implemented');
  }

}
