/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SubscriberList } from '../utils';
import { SBMessageBus } from './messaging';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/filter';

@Injectable()
export class SBLinker {

  private _editModeSubscribers = new SubscriberList<boolean>();

  constructor(private _bus: SBMessageBus) { }

  onEditMode() {
    return this._editModeSubscribers.create();
  }

  onStoryChange(id: number): Observable<any> {
    const o = this._bus.on('change');
    o.subscribe(_ => {
      console.log('change');
      this._editModeSubscribers.next(true)
    });
    return o.filter(data => data.storyId === id);
  }

  onStoryPublish(id) {
    const o = this._bus.on('published');
    o.subscribe(_ => this._editModeSubscribers.next(false));
    return o.filter(data => data.storyId === id);
  }
}
