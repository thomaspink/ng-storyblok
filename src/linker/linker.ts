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
import 'rxjs/add/operator/map';

@Injectable()
export class SBLinker {

  private _onEditMode: Subject<boolean> = new Subject();
  private _onPublish: Observable<any>;

  constructor(private _bus: SBMessageBus) {
    _bus.on('pingBack').subscribe(_ => _bus.send('initialized'));
    _bus.on('enterEditmode').subscribe(_ => this._onEditMode.next(true));
    this._onPublish = this._bus.on('published');
    this._onPublish.subscribe(_ => this._onEditMode.next(false));
    _bus.send('ping');
  }

  onEditMode(): Observable<boolean> {
    return this._onEditMode.asObservable();
  }

  onStoryChange(id: number): Observable<any> {
    const o = this._bus.on('change');
    o.subscribe(data => {
      console.log('change');
    });
    return o.filter(data => data.storyId === id);
  }

  onStoryPublish(id) {
    return this._onPublish.filter(data => data.storyId === id);
  }
}
