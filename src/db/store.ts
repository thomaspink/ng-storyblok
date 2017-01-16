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
// import { SBLinker } from '../linker/linker';
import { SBStoryRecord } from './story_record';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

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
export abstract class SBStore {

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
   * @returns {SBStoryObservable}
   *
   * @memberOf SBStore
   */
  abstract story(slugOrId: string | number, version?: string): SBStoryRecord;

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
  abstract findStory(slugOrId: number | string): Promise<SBStory>;

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
  abstract peekStory(slugOrId: number | string): SBStory;

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
  abstract loadStory(slugOrId: number | string): Promise<SBStory>;

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

@Injectable()
export class SBDefaultStore implements SBStore {

  private _storiesOld: StoryObject[] = [];
  private _storyObservables: SBStoryRecord[] = [];
  private _stories: SBStoryRecord[] = [];
  private _lastPeekedStory: StoryObject;
  private _collections: { [key: string]: CollectionObject } = {};

  constructor(private _adapter: SBAdapter, private _serializer: SBSerializer) {
    // _linker.onEditMode().subscribe(isEditMode => {
    //   console.log('edit ' + isEditMode);
    // });
  }

  /* @override */
  story(slugOrId: string | number): SBStoryRecord {
    return this._getStoryRecord(slugOrId) || this._fetchStoryFromAdapter(slugOrId);
  }

  /* @override */
  findStory(slugOrId: number | string): Promise<SBStory> {
    const result = this.peekStory(slugOrId);
    if (result)
      return new Promise(resolve => resolve(result));
    else
      return this.loadStory(slugOrId);
  }

  /* @override */
  peekStory(slugOrId: number | string): SBStory {
    const record = this._getStoryRecord(slugOrId);
    return record && record.$story || undefined;
  }

  /* @override */
  loadStory(slugOrId: number | string): Promise<SBStory> {
    return this._fetchStoryFromAdapter(slugOrId).toPromise();
  }

  /* @override */
  reloadStory(story: SBStory): Promise<SBStory> {
    return this._fetchStoryFromAdapter(story).toPromise();
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
    return !!result ? result.collection : undefined;
  }

  /* @override */
  loadCollection(path: string): Promise<SBStory[]> {
    return this._adapter.fetchCollection(path).then(c => {
      const collection = this._serializer.normalizeCollection(c);
      // collection.forEach(story => this._setStoryObject(story));
      this._setCollectionObject(path, collection);
      return collection;
    });
  }
  /* @override */
  reloadCollection(path: string): Promise<SBStory[]> {
    return this.loadCollection(path);
  }



  /* @internal */
  private _peekCollectionObject(path: string): CollectionObject {
    return this._collections[path] || undefined;
  }

  /* @internal */
  private _setCollectionObject(path: string, collection: SBStory[]) {
    if (!Array.isArray(collection))
      return;
    const result = this._peekCollectionObject(path);
    // collection.forEach(s => this._setStoryObject(s));
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

  /* @internal */
  private _getStoryRecord<S extends SBStory>(idOrSlugOrStory: number | string | S):
    SBStoryRecord {
    if (typeof idOrSlugOrStory === 'string' && !isNaN(<any>idOrSlugOrStory)) {
      // Not shure if we should throw an error or parse the ID to a number
      // if it is provided as a string.
      // Code for parsing is commented after the error
      throw new Error(`You are requesting a story with th ID "${idOrSlugOrStory}" ` +
        `but it has to be a number not a string`);
      // idOrSlugOrStory = parseInt(slug, 10);
    }
    return this._stories.find(record =>
      record.$story instanceof SBStory && (record.$story.id === idOrSlugOrStory ||
        record.$story.slug === idOrSlugOrStory || record.$story === idOrSlugOrStory));
  }

  /* @internal */
  private _fetchStoryFromAdapter(idOrSlugOrStory) {
    const slugOrId: number | string = idOrSlugOrStory['id'] || idOrSlugOrStory;
    let record = this._getStoryRecord(idOrSlugOrStory);
    if (!record) {
      record = new SBStoryRecord();
      this._stories.push(record);
    }
    this._adapter.fetchStory(slugOrId, '').then(s => {
      const story = this._serializer.normalizeStory(s);
      if (slugOrId !== story.id && slugOrId !== story.slug) {
        throw new Error(`The id or slug "${slugOrId}" provided for loading a story does not ` +
          `match the ones (id: ${story.id}, slug: "${story.slug}") in the loaded payload`);
      }
      const existingRecord = this._getStoryRecord(slugOrId);
      if (existingRecord && existingRecord !== record) {
        record._parent = existingRecord;
      }
      record.next(story);
    });

    return record;
  }
}
