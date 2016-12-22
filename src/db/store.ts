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
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';

type StoryObject = { story: SBStory; version?: string; observers: Observer<SBStory>[] };
type CollectionObject = { collection: SBStory[]; observers: Observer<SBStory[]>[] };

/**
 * The SBStore will store, load, fetch and normalize stories.
 * You can use high-level methods for subscribing, loading,
 * finding and peeking stories.
 *
 * @export
 * @class SBStore
 */
@Injectable()
export abstract class SBStore  {

  /**
   * Get an Observable on a story by a given slug or ID. When subscribing
   * or switching it to the "hot" state, the method will lookup the story
   * from the store or otherwise fetch it from the adapter. Everytime the
   * story changes, gets updated or reloaded (see `reloadStory`) the
   * Observer will call next with the new resolved story.
   *
   * For more information on Observables or Observers have a look on RxJS:
   * http://reactivex.io/rxjs/
   *
   * @param {(string | number)} slugOrId
   * @param {string} [version]
   * @returns {Observable<SBStory>}
   *
   * @memberOf SBStore
   */
  abstract story(slugOrId: string | number, version?: string): Observable<SBStory>;

  /**
   * Get a story by a given slug or ID by looking up the story from the store if it is
   * available, otherwise it will trigger a fetch from the server.
   *
   * This method will asynchronously peek the story from the store. If the story is not
   * present in the store (cache), it will be loaded by the adapters `fetchStory` method.
   * A story is available if it has been fetched earlier.
   *
   *
   * @param {(number | string)} slugOrId
   * @param {string} [version]
   * @returns {Promise<SBStory>}
   *
   * @memberOf SBStore
   */
  abstract findStory(slugOrId: number | string, version?: string): Promise<SBStory>;

  /**
   * Get a story by a given slug or ID without triggering a fetch.
   *
   * This method will synchronously return the story if it is available in the store,
   * otherwise it will return `undefined`.
   * A story is available if it has been fetched earlier.
   *
   * @param {(number | string)} slugOrId
   * @param {string} [version]
   * @returns {SBStory}
   *
   * @memberOf SBStore
   */
  abstract peekStory(slugOrId: number | string, version?: string): SBStory;

  /**
   * Get a story by a given slug or ID by triggering a fetch on the adapter
   * and loading it fresh from the server.
   *
   * This method will asynchronously fetch the story from the adapter and return a Promise
   * that will be resolved with the story.
   *
   * @param {(number | string)} slugOrId
   * @param {string} [version]
   * @returns {Promise<SBStory>}
   *
   * @memberOf SBStore
   */
  abstract loadStory(slugOrId: number | string, version?: string): Promise<SBStory>;

  /**
   * This method will asynchronously load a story again by calling `fetchStory` on the adapter
   * and update the story in the store.
   *
   * @param {SBStory} story
   * @returns {Promise<SBStory>}
   *
   * @memberOf SBStore
   */
  abstract reloadStory(story: SBStory): Promise<SBStory>;

  /**
   * Get an Observable on a collection of stories by a given path. When subscribing
   * or switching it to the "hot" state, the method will lookup the collection and
   * all its stories from the story or otherwise fetch it from the adapter.
   * Everytime the collection changes, gets updated or reloaded (see `reloadCollection`)
   * the Observer will call next with the new resolved collection.
   *
   * For more information on Observables or Observers have a look on RxJS:
   * http://reactivex.io/rxjs/
   *
   * @param {string} path
   * @returns {Observable<SBStory[]>}
   *
   * @memberOf SBStore
   */
  abstract collection(path: string): Observable<SBStory[]>;

  /**
   * Get a collection of stories by a path by looking up the story from the store if it is
   * available, otherwise it will trigger a fetch from the server.
   *
   * This method will asynchronously peek the collection from the store. If the collection is
   * not present in the store (cache), it will be loaded by the adapters `fetchCollection` method.
   * A collection is available if it has been fetched earlier.
   *
   * @param {string} path
   * @returns {Promise<SBStory[]>}
   *
   * @memberOf SBStore
   */
  abstract findCollection(path: string): Promise<SBStory[]>;

  /**
   * Get a collection of stories by a given path without triggering a fetch.
   *
   * This method will synchronously return the collection if it is available in the store,
   * otherwise it will return `undefined`.
   * A story is available if it has been fetched earlier.
   *
   * @param {string} path
   * @returns {SBStory[]}
   *
   * @memberOf SBStore
   */
  abstract peekCollection(path: string): SBStory[];

  /**
   * Get a collection of stories by a given path by triggering a fetch on the adapter
   * and loading it fresh from the server.
   *
   * This method will asynchronously fetch the collection from the adapter and return
   * a Promise that will be resolved with the collection.
   *
   * @param {string} path
   * @returns {Promise<SBStory[]>}
   *
   * @memberOf SBStore
   */
  abstract loadCollection(path: string): Promise<SBStory[]>;

  /**
   * This method will asynchronously reload a collection again by calling `fetchCollection`
   * on the adapter and update the collection in the store.
   *
   * @param {string} path
   * @returns {Promise<SBStory[]>}
   *
   * @memberOf SBStore
   */
  abstract reloadCollection(path: string): Promise<SBStory[]>;
}

let __UNDEFINED__;

@Injectable()
export class SBDefaultStore implements SBStore {

  private _stories: StoryObject[] = [];
  private _lastPeekedStory: StoryObject;
  private _collections: { [key: string]: CollectionObject } = {};

  constructor(private _adapter: SBAdapter, private _serializer: SBSerializer) { }

  /* @override */
  story(slugOrId: string | number, version?: string): Observable<SBStory> {
    return Observable.create((observer: Observer<SBStory>) => {
      this.findStory(slugOrId, version).then(s => {
        this._peekStoryObject(slugOrId, version).observers.push(observer);
        this._notifyStoryUpdate(slugOrId);
      }).catch(reason => {
        // not sure if we should call error callback on all
        // stored observers for that story or just ignore them
        this._notifyStoryError(slugOrId, reason, version);

        // call error callback on the provided observer if we
        // catch an error. Also call complete and don't store
        // the latest observer which causes the error
        observer.error(reason);
        observer.complete();
      });
    });
  }

  /* @override */
  findStory(slugOrId: number | string, version?: string): Promise<SBStory> {
    const result = this.peekStory(slugOrId, version);
    if (result)
      return new Promise(resolve => resolve(result));
    else
      return this.loadStory(slugOrId, version);
  }

  /* @override */
  peekStory(slugOrId: number | string, version?: string): SBStory {
    const result = this._peekStoryObject(slugOrId, version);
    return !!result ? result.story : __UNDEFINED__;
  }

  /* @override */
  loadStory(slugOrId: number | string, version?: string): Promise<SBStory> {
    return this._adapter.fetchStory(slugOrId, version).then(s => {
      const story = this._serializer.normalizeStory(s);
      if (slugOrId !== story.id && slugOrId !== story.slug)
        throw new Error(`The id or slug "${slugOrId}" provided for loading a story` +
          `does not match the ones (id: ${story.id}, slug: "${story.slug}") in the loaded payload`);
      this._setStoryObject(story, version);
      return story;
    });
  }

  /* @override */
  reloadStory(story: SBStory): Promise<SBStory> {
    return this.loadStory(story.id, this._getVersion(story));
  }

  /* @override */
  collection(path: string): Observable<SBStory[]> {
    return Observable.create((observer: Observer<SBStory[]>) => {
      this.findCollection(path).then(s => {
        const obj = this._peekCollectionObject(path);
        obj.observers.push(observer);
        observer.next(s);
      }).catch(reason => {
        // not sure if we should call error callback on all
        // stored observers for that story or just ignore them
        this._notifyCollectionError(path, reason);

        // call error callback on the provided observer if we
        // catch an error. Also call complete and don't store
        // the latest observer which causes the error
        observer.error(reason);
        observer.complete();
      });
    });
  }

  /* @override */
  findCollection(path: string): Promise<SBStory[]> {
    const result = this.peekCollection(path);
    if (result)
      return new Promise(resolve => resolve(result));
    else
      return this.loadCollection(path);
  }

  /* @override */
  peekCollection(path: string): SBStory[] {
    const result = this._peekCollectionObject(path);
    return !!result ? result.collection : __UNDEFINED__;
  }

  /* @override */
  loadCollection(path: string): Promise<SBStory[]> {
    return this._adapter.fetchCollection(path).then(c => {
      const collection = this._serializer.normalizeCollection(c);
      collection.forEach(story => this._setStoryObject(story));
      this._setCollectionObject(path, collection);
      return collection;
    });
  }
  /* @override */
  reloadCollection(path: string): Promise<SBStory[]> {
    return this.loadCollection(path);
  }


  /* @internal */
  private _peekStoryObject(slugOrId: number | string, version?: string): StoryObject {
    let id = typeof slugOrId === 'number' ? slugOrId : __UNDEFINED__;
    let slug = typeof slugOrId === 'string' ? slugOrId : __UNDEFINED__;
    if (slug && !isNaN(<any>slug)) {
      // Not shure if we should throw an error or parse the ID to a number
      // if it is provided as a string.
      // Code for parsing is commented after the error
      throw new Error(
        `You are requesting a story with th ID "${slug}" but it has to be a number not a string`);
      // id = parseInt(slug, 10);
      // slug = __UNDEFINED__;
    }
    if (this._lastPeekedStory && this._lastPeekedStory.story &&
       (this._lastPeekedStory.story.id === id || this._lastPeekedStory.story.slug === slug))
      return this._lastPeekedStory;
    this._lastPeekedStory = this._stories.find(s => {
      return (s.story.id === id || s.story.slug === slug) && !version ||
        (!!version && s.version === version);
    });
    return this._lastPeekedStory || __UNDEFINED__;
  }

  /* @internal */
  private _setStoryObject(story: SBStory, version?: string) {
    let result = this._peekStoryObject(story.id, version);
    if (result) {
      result.story = story;
      this._notifyStoryUpdate(story.id);
    } else {
      this._stories.push({
        story: story,
        version: version,
        observers: []
      });
    }
  }

  /* @internal */
  private _getVersion(story: SBStory) {
    const res = this._peekStoryObject(story.id);
    return res && res.version;
  }

  /* @internal */
  private _notifyStoryUpdate(slugOrId: number | string, version?: string) {
    const obj = this._peekStoryObject(slugOrId, version);
    if (obj && obj.observers)
      obj.observers.forEach(o => o.next(obj.story));
  }

  /* @internal */
  private _notifyStoryError(slugOrId: number | string, error: any, version?: string) {
    const obj = this._peekStoryObject(slugOrId, version);
    if (obj && obj.observers)
      obj.observers.forEach(o => o.error(error));
  }

  /* @internal */
  private _peekCollectionObject(path: string): CollectionObject {
    return this._collections[path] || __UNDEFINED__;
  }

  /* @internal */
  private _setCollectionObject(path: string, collection: SBStory[]) {
    if (!Array.isArray(collection))
      return;
    const result = this._peekCollectionObject(path);
    collection.forEach(s => this._setStoryObject(s));
    if (result) {
      result.collection = collection;
      this._notifyCollectionUpdate(path);
    } else {
      this._collections[path] = {
        collection: collection,
        observers: []
      };
    }
  }

  /* @internal */
  private _notifyCollectionUpdate(path: string) {
    const obj = this._peekCollectionObject(path);
    if (obj && obj.observers)
      obj.observers.forEach(o => o.next(obj.collection));
  }

  /* @internal */
  private _notifyCollectionError(path: string, error: any) {
    const obj = this._peekCollectionObject(path);
    if (obj && obj.observers)
      obj.observers.forEach(o => o.error(error));
  }
}
