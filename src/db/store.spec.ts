/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { SBModule } from '../module';
import { SBStore, SBDefaultStore } from './store';
import { SBAdapter, SBHttpAdapter } from './adapter';
import { SBSerializer, SBDefaultSerializer } from './serializer';
import { SBStory } from './model';
import { collectionPayload, storyPayload, HttpMockFactory } from './adapter.spec';
import { Http, RequestOptionsArgs, Response, ResponseOptions } from '@angular/http';

var requestCount = 0;

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
        { provide: Http, useValue: HttpMockFactory(() => requestCount++) }
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

  describe('.loadStory', () => {
    it('should return a promise', () => {
      expect(store.loadStory('home') instanceof Promise).toBeTruthy();
    });

    it('should fetch a story from the adapter and resolve the promise', (done) => {
      requestCount = 0;
      store.loadStory('home').then(s => {
        expect(s instanceof SBStory).toBeTruthy();
        expect(requestCount).toBe(1);
        done();
      });
    });

    it('should reject the promise on error', (done) => {
      store.loadStory('error').then(s => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(error).toBeDefined();
        done();
      });
    });
  });

  describe('.peekStory', () => {
    it('should return a story', (done) => {
      store.loadStory('home').then(s => {
        expect(store.peekStory('home') instanceof SBStory).toBeTruthy();
        done();
      });
    });

    it('should return "undefined" if not found', () => {
      expect(store.peekStory('notfound')).toBeUndefined();
    });

    it('should not fetch a story from the adapter', (done) => {
      store.loadStory('home').then(s => {
        requestCount = 0;
        store.peekStory('home');
        expect(requestCount).toBe(0);
        done();
      });
    });
  });

  describe('.findStory', () => {
    it('should return a promise', () => {
      expect(store.findStory('home') instanceof Promise).toBeTruthy();
    });

    it('should fetch a story from the adapter if it is not already loaded', (done) => {
      requestCount = 0;
      store.findStory('home').then(s => {
        expect(s instanceof SBStory).toBeTruthy();
        expect(requestCount).toBe(1);
        done();
      });
    });

    it('should resolve with a story from the cache if it is already loaded', (done) => {
      requestCount = 0;
      store.findStory('home').then(s => {
        store.findStory('home').then(s1 => {
          expect(s instanceof SBStory).toBeTruthy();
          expect(requestCount).toBe(1);
          done();
        });
      });
    });

    it('should reject the promise if an error happens', (done) => {
      store.findStory('error').then(s => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(error).toBeDefined();
        done();
      });
    });
  });

  describe('.reloadStory', () => { });

  describe('.collection', () => {
    // it('should return an observable', () => {
    //   expect(store.collection('collection') instanceof Observable).toBeTruthy();
    // });

    // it('should be subscribable and resolve a collection of story', (done) => {
    //   store.collection('collection').subscribe(c => {
    //     expect(Array.isArray(c)).toBeTruthy();
    //     expect(c.length).toBe(1);
    //     expect(c[0] instanceof SBStory).toBeTruthy();
    //     done();
    //   });
    // });

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
  describe('.reloadCollection', () => { });
});
