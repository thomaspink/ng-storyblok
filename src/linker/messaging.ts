/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SBConfig } from '../config';

/**
 * Injectable service for message communication between
 * the application and the storyblok frame.
 *
 * @export
 * @class SBMessageBus
 */
@Injectable()
export class SBMessageBus {

  private _subs: { [key: string]: Subject<any> } = {};
  // private _isPinging = false;
  // private _isActive = false;
  // private _pendingPings: Subscriber<any>[] = [];

  constructor(private _config: SBConfig) {
    if (this._isInIFrame) {
      window.addEventListener('message', event => this._onMessage(event));
      // this.ping();
    }
  }

  /* @internal */
  private get _protocol() {
    const protocol = location.protocol.replace(':', '');
    return protocol !== 'http' && protocol !== 'https' ? 'https' : protocol;
  }

  /* @internal */
  private get _parentDomain() {
    return this._config.customParent || this._protocol + '://app.storyblok.com';
  }

  /* @internal */
  private get _isInIFrame() {
    return !!window && !!window.parent && window.location !== window.parent.location;
  }

  /**
   * Send a message with an action and data to the storyblok
   * frame.
   *
   * @param {string} action
   * @param {*} [data]
   *
   * @memberOf SBMessageBus
   */
  send(action: string, data?: any) {
    this._sendMessage(action, data);
  }

  /**
   * Creates and returns an Observable for a specific action
   * where you can subscribe on. This Observable will fire
   * when an event with the provided action is received.
   *
   * @param {string} action
   * @returns {Observable<any>}
   *
   * @memberOf SBMessageBus
   */
  on(action: string): Observable<any> {
    let sub = this._subs[action];
    if (!(sub instanceof Subject)) {
      sub = new Subject();
      this._subs[action] = sub;
    }
    return sub.asObservable();
  }

  /**
   * Pings the storyblok frame and waits for a pingBack.
   * Returns an Observable that will fire once when the
   * pingBack event is received.
   * This method is usefull for checking if the app runs
   * in the storyblok edit frame.
   *
   * @returns {Observable<void>}
   *
   * @memberOf SBMessageBus
   */
  // ping(): Observable<void> {
  //   if (!this._isPinging && !this._isActive) {
  //     this._isPinging = true;
  //     this._sendMessage('ping');
  //   }
  //   return new Observable<void>((subscriber: Subscriber<void>) => {
  //     if (this._isActive)
  //       subscriber.next();
  //     else
  //       this._pendingPings.push(subscriber);
  //   });
  // }

  /* @internal */
  private _onMessage(event: MessageEvent) {
    if (!(event instanceof MessageEvent))
      return;
    if (!event.data.action)
      return;

    if (event.origin !== this._parentDomain)
      return;

    const data = event.data;
    const action = data.action;
    delete data.action;

    const sub = this._subs[action];
    if (sub instanceof Subject)
      sub.next(data);
  }

  /* @internal */
  private _sendMessage(action: string, data?: any) {
    if (!this._isInIFrame)
      return;

    let request = typeof data !== 'undefined' ? data : {};
    if (typeof request !== 'object' || Array.isArray(request)) {
      request = {
        data: data
      };
    }
    request['action'] = action;
    window.parent.postMessage(request, this._parentDomain);
  }

}
