/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBMessageBus } from './messaging';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';

@Injectable()
export class SBLinker {

  private _onEditMode: Subject<boolean> = new Subject();

  constructor(private _bus: SBMessageBus) { }

  onEditMode(): Observable<boolean> {
    return this._onEditMode.asObservable();
  }

  onStoryChange(id: number): Observable<any> {
    const o = this._bus.on('change');
    o.subscribe(_ => {
      console.log('change');
    });
    return o.filter(data => data.storyId === id);
  }

  onStoryPublish(id) {
    const o = this._bus.on('published');
    return o.filter(data => data.storyId === id);
  }
}
