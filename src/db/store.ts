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
import { SBLinker } from '../linker/linker';
import { SBStoryRecord, SBStoryVersion } from './story_record';
import { SBCollectionRecord } from './collection_record';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

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
   * @returns {SBCollectionRecord}
   *
   * @memberOf SBStore
   */
  abstract collection(path: string): SBCollectionRecord;

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

  private _stories: SBStoryRecord[] = [];
  private _collections: SBCollectionRecord[] = [];

  constructor(private _adapter: SBAdapter, private _serializer: SBSerializer,
    private _linker: SBLinker) {
    _linker.onEditMode().subscribe(isEditMode => {
      if (isEditMode) {
        // Enter Edit Mode
        console.log('enter edit mode');
        this._stories.forEach(r => {
          console.log(r.$story);
          this._fetchStoryFromAdapter(r, SBStoryVersion.Draft);
        });
      } else {
        // Leave Edit Mode
        console.log('leave edit mode');
      }
    });
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
  collection(path: string): SBCollectionRecord {
    return this._getCollectionRecord(path) || this._fetchCollectionFromAdapter(path);
  }

  /* @override */
  findCollection(path: string): Promise<SBStory[]> {
    const result = this.peekCollection(path);
    return result ? new Promise(resolve => resolve(result)) : this.loadCollection(path);
  }

  /* @override */
  peekCollection(path: string): SBStory[] {
    const result = this._getCollectionRecord(path);
    return !!result && !!result.$collection ? result.$collection.map(r => r.$story) : undefined;
  }

  /* @override */
  loadCollection(path: string): Promise<SBStory[]> {
    return this._fetchCollectionFromAdapter(path).map(rl => rl.map(r => r.$story)).toPromise();
  }
  /* @override */
  reloadCollection(path: string): Promise<SBStory[]> {
    return null;
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
  /* tslint:disable-next-line:max-line-length */
  private _fetchStoryFromAdapter(slugOrId: number | string, version?: SBStoryVersion): SBStoryRecord;
  private _fetchStoryFromAdapter(story: SBStory, version?: SBStoryVersion): SBStoryRecord;
  private _fetchStoryFromAdapter(record: SBStoryRecord, version?: SBStoryVersion): SBStoryRecord;
  private _fetchStoryFromAdapter(idOrSlugOrStoryOrRecord, version = SBStoryVersion.Published) {
    let record = idOrSlugOrStoryOrRecord instanceof SBStoryRecord ?
      idOrSlugOrStoryOrRecord : this._getStoryRecord(idOrSlugOrStoryOrRecord);
    let slugOrId: number | string;
    if (record) {
      if (record.$story) {
      // console.log(record, record.$story);
        slugOrId = record.$story.id;
      } else {
        slugOrId = idOrSlugOrStoryOrRecord['id'] || idOrSlugOrStoryOrRecord;
        record = new SBStoryRecord();
        this._stories.push(record);
      }
    }
    console.log(slugOrId);
    this._adapter.fetchStory(slugOrId, version === SBStoryVersion.Draft ? 'draft' : '').then(s => {
      const story = this._serializer.normalizeStory(s);
      if (slugOrId !== story.id && slugOrId !== story.slug) {
        throw new Error(`The id or slug "${slugOrId}" provided for loading a story does not ` +
          `match the ones (id: ${story.id}, slug: "${story.slug}") in the loaded payload`);
      }
      const existingRecord = this._getStoryRecord(slugOrId);
      if (existingRecord && existingRecord !== record) {
        record._parent = existingRecord;
      }
      // fallback because friend properties are not implemented in
      // Typescript for now. More information in SBStoryRecord
      record['_version'] = version;

      record.next(story);
    }).catch(reason => {
      console.error(reason);
      record.error(reason);
    });

    return record;
  }

  /* @internal */
  private _getCollectionRecord(pathOrCollection: string | SBStoryRecord[]): SBCollectionRecord {
    return this._collections.find(
      r => r.path === pathOrCollection || r.$collection === pathOrCollection);
  }

  /* @internal */
  private _fetchCollectionFromAdapter(pathOrCollection: string | SBStoryRecord[]):
    SBCollectionRecord {
    let record = this._getCollectionRecord(pathOrCollection);
    let path = <string>pathOrCollection;
    if (!record) {
      record = new SBCollectionRecord();
      this._collections.push(record);
    } else {
      path = record.path;
    }

    this._adapter.fetchCollection(path).then(c => {
      const collection = this._serializer.normalizeCollection(c);

      const existingRecord = this._getCollectionRecord(path);
      if (existingRecord && existingRecord === record) {
        record._parent = existingRecord;
      }

      record.next(collection.map(story => {
        let storyRecord = this._getStoryRecord(story.id);
        if (storyRecord) {
          storyRecord.next(story);
        } else {
          storyRecord = new SBStoryRecord(story);
          this._stories.push(storyRecord);
        }
        return storyRecord;
      }));
    });
    return record;
  }
}
