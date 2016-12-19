/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SBModule } from '../module';
import { SBStore, SBDefaultStore } from './store';
import { SBAdapter, SBHttpAdapter } from './adapter';
import { SBSerializer, SBDefaultSerializer } from './serializer';
import { SBStory } from './model';
import { HttpMock } from './adapter.spec';

describe('SBHttpAdapter', () => {
  var store: SBStore;

  beforeEach(() => {
    function storyblockConfigFactory() {
      return {
        accessToken: 'token'
      };
    }
    TestBed.configureTestingModule({
      imports: [SBModule.forRoot(function storyblockConfigFactory() {
      return {
        accessToken: 'token'
      };
    })],
      providers: [
        // Provided SBHttpAdapter and SBDefaultSerializer again,
        // so we are not depending on the adapter and serializer
        // the module provides and we can be sure they are the
        // right ones (default and http)
        { provide: SBAdapter, useClass: SBHttpAdapter },
        { provide: SBSerializer, useClass: SBDefaultSerializer },
        { provide: Http, useClass: HttpMock }
      ]
    });

    inject([SBStore], (_store: SBStore) => {
      store = _store;
    })();
  });

  it('should be injectable by the token SBStore', () => {
    expect(store instanceof SBDefaultStore).toBeTruthy();
  });

  it('does implement SBStore', () => {
    expect(typeof store.story).toBe('function');
    expect(typeof store.loadStory).toBe('function');
    expect(typeof store.peekStory).toBe('function');
    expect(typeof store.findStory).toBe('function');
    expect(typeof store.reloadStory).toBe('function');
    expect(typeof store.collection).toBe('function');
    expect(typeof store.loadCollection).toBe('function');
    expect(typeof store.peekCollection).toBe('function');
    expect(typeof store.findCollection).toBe('function');
    expect(typeof store.reloadCollection).toBe('function');
  });

  describe('.story', () => {
    it('should return an observable', () => {
      expect(store.story('home') instanceof Observable).toBeTruthy();
    });

    it('should be subscribable and resolve a story', (done) => {
      store.story('home').subscribe(s => {
        expect(s instanceof SBStory).toBeTruthy();
        done();
      });
    });

    it('should call the error callback when thrown', (done) => {
      store.story('wrong').subscribe(s => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(!!error).toBeTruthy();
        done();
      });
    });
  });
  describe('.loadStory', () => { });
  describe('.peekStory', () => { });
  describe('.findStory', () => { });
  describe('.reloadStory', () => { });
  describe('.collection', () => {
    it('should return an observable', () => {
      expect(store.collection('collection') instanceof Observable).toBeTruthy();
    });

    it('should be subscribable and resolve a collection of story', (done) => {
      store.collection('collection').subscribe(c => {
        expect(Array.isArray(c)).toBeTruthy();
        expect(c.length).toBe(1);
        expect(c[0] instanceof SBStory).toBeTruthy();
        done();
      });
    });

    // it('should call the error callback when thrown', (done) => {
    //   store.collection('wrong').subscribe(s => {
    //     expect(false).toBeTruthy();
    //     done();
    //   }, error => {
    //     expect(!!error).toBeTruthy();
    //     done();
    //   });
    // });
  });
  describe('.loadCollection', () => { });
  describe('.peekCollection', () => { });
  describe('.findCollection', () => { });
  describe('.reloadCollection', () => {});
});
