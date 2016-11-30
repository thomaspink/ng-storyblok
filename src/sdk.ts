/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { OpaqueToken } from '@angular/core';
import { Injectable, Inject } from '@angular/core';
import { SB_CONFIG, SBConfig } from './config';
import { DOCUMENT,  } from '@angular/platform-browser';

export interface IStoryblokConfig {
  accessToken: string;
  space?: string;
  endPoint?: string;
  type?: string;
}

export interface IStoryblok {
  parent: string;
  overlay: any;
  currentUid: string;
  storyId: string;
  calcTimer: number;
  currentBlok: Object;
  events: {
    'change': Function[];
    'published': Function[];
    'unpublished': Function[];
    'viewLiveVersion': Function[];
    'enterEditmode': Function[];
  };
  config: IStoryblokConfig;
  sidebarOpen: boolean;
  removeClass(el: Element, className: string);
  addClass(el: Element, className: string);
  addEvent(el: Element, type, handler);
  removeEvent(el: Element, type, handler);
  getOffset(el: Element);
  getNextSiblings(el: Element, filter);
  getParam(val: any);
  initWidget();
  toggleSidebar();
  extend(obj, src);
  initConfig(config);
  init(config: IStoryblokConfig);
  postMessage();
  addMessageListener();
  receiveMessage(event);
  outlineOnMove();
  enterEditmode(attr);
  calcPosition();
  setToolTip();
  editElement(e);
  get(attr: { id?: number; slug?: string; version?: string },
    success: (data: {}) => void, error?: (error: string | any) => void);
  on(event: string, fn: (...args: any[]) => void);
  emit(event: string, ...args: any[]);
  toArray(list, start: number);
}

/**
 * Injectable wrapper for the storyblok sdk.
 * Needs the config so it can init storyblok.
 *
 * @export
 * @class StoryblokRef
 */
@Injectable()
export class StoryblokRef {
  private _sb: IStoryblok;

  get window(): any {
    return window || undefined;
  }

  constructor( @Inject(SB_CONFIG) config: SBConfig, @Inject(DOCUMENT) private document: Document) {
    // check if an accessToken is provided
    if (!config.accessToken)
      throw new Error(
        `No public access token found for storyblok. Please insert one in the config`);

    if (!this.window)
      throw new Error(`Storyblok SDK needs window which is not available in this environment.
        Are you using the SDKAdapter or the storyblok SDK on a nodejs server?
        Use SBHttpAdapter instead!`);

    // check if storyblok sdk is available
    if (!this.window.storyblok)
      throw new Error('Storyblok sdk not found');

    this._sb = this.window.storyblok;
    this._sb.init({
      accessToken: config.accessToken,
      space: config.space || this._sb.config.space,
      type: config.type || this._sb.config.type,
      endPoint: config.endPoint || this._sb.config.endPoint,
    });
  }

  get isInitialized() {
    return !!this._sb && !!this._sb.config.accessToken;
  }

  get instance() {
    if (!this.isInitialized)
      throw new Error('Can not access storyblok instance because it is not yet initialized!');
    return this._sb;
  }

  get(attr: { id?: number; slug?: string; version?: string }) {
    if (typeof attr !== 'object')
      throw new TypeError(`You have to provide an attributes object to the 'get' method.
        The object should at least consist of an 'id' or a 'slug'`);
    if (typeof attr.id === 'undefined' && typeof attr.slug === 'undefined')
      throw new TypeError('Id or slug has to be set in the attributes object!');
    if (!this.isInitialized)
      throw new Error(
        `Can not load a story, because the storyblok in not yet initialized or loaded!`);

    // TODO: Rework if storyblok sdk is fixed
    if (attr.id) {
      attr.slug = attr.id + '';
    }

    return new Promise((resolve, reject) => {
      this._sb.get(attr, data => resolve(data), error => reject(error));
    });
  }

  on(event: string, fn: (...args: any[]) => void) {
    return this._sb.on.apply(this, arguments);
  }

  emit(event: string, ...args: any[]) {
    return this._sb.emit.apply(this, arguments);
  }
}

export const STORYBLOK = new OpaqueToken('STORYBLOK');
