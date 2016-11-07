/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { StoryblokRef } from '../sdk';
import { Observable } from 'rxjs/Rx';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable()
export abstract class SBAdapter {
  abstract loadStory(slug: string, version?: string): Observable<any>;
  abstract loadStory(id: number, version?: string): Observable<any>;
}

@Injectable()
export class SBSdkAdapter implements SBAdapter {
  constructor(private _sdk: StoryblokRef) { }

  loadStory(slug: string, version?: string): Observable<any>;
  loadStory(id: number, version?: string): Observable<any>;  
  loadStory(slugOrId: string | number, version?: string): Observable<any> {
    const options: { id?: number; slug?: string; version?: string } = {};
    if (typeof slugOrId === 'number')
      options.id = slugOrId;
    else if (typeof slugOrId === 'string')
      options.slug = slugOrId;
    else
      throw new TypeError(`You have to provide the slug(string) or the id(number) as the first parameter!`);
    if (typeof version === 'string')
      options.version = version;
    else if(typeof version !== 'undefined')
      throw new TypeError('The version parameter for `loadStory` has to be a string!');
    return fromPromise(this._sdk.get(options));
  }
}
