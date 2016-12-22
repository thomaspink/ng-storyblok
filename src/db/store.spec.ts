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
import { SBStory, SBComponent } from './model';
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
          expect(s1 instanceof SBStory).toBeTruthy();
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

  describe('.reloadStory', () => {
    it('should return a promise', (done) => {
      store.findStory('home').then(s => {
        expect(store.reloadStory(s) instanceof Promise).toBeTruthy();
        done();
      });
    });

    it('should fetch the story from the adapter', (done) => {
      requestCount = 0;
      store.findStory('home').then(s => {
        expect(requestCount).toBe(1);
        store.reloadStory(s).then(s1 => {
          expect(requestCount).toBe(2);
          expect(s1).toBe(store.peekStory('home'));
          done();
        });
      });
    });

    it('should reject the promise if an error happens', (done) => {
      store.reloadStory(new SBStory({
        id: 1,
        name: 'something',
        slug: 'something',
        fullSlug: 'something',
        created: new Date(),
        published: new Date(),
        alternates: [],
        sortByDate: false,
        tagList: [],
        content: new SBComponent({ _uid: 'id', type: 'something', model: {} })
      })).then(s => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(error).toBeDefined();
        done();
      });
    });
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
      store.story('error').subscribe(s => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(!!error).toBeTruthy();
        done();
      });
    });

    it('should call next on the observer if story changes', (done) => {
      var count = 0;
      store.story('home').subscribe(s => {
        count++;
        if (count === 1) {
          store.reloadStory(s);
        } else {
          expect(count).toBe(2);
          done();
        }
      });
    });
  });

  describe('.loadCollection', () => {
    it('should return a promise', () => {
      expect(store.loadCollection('collection') instanceof Promise).toBeTruthy();
    });

    it('should fetch a collection from the adapter and resolve the promise', (done) => {
      requestCount = 0;
      store.loadCollection('collection').then(c => {
        expect(Array.isArray(c)).toBeTruthy();
        expect(c.length).toBe(1);
        expect(c[0] instanceof SBStory).toBeTruthy();
        expect(requestCount).toBe(1);
        done();
      });
    });

    it('should reject the promise on error', (done) => {
      store.loadCollection('error').then(c => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(error).toBeDefined();
        done();
      });
    });
  });

  describe('.peekCollection', () => {
    it('should return a collection', (done) => {
      store.loadCollection('collection').then(c => {
        expect(Array.isArray(store.peekCollection('collection'))).toBeTruthy();
        done();
      });
    });

    it('should return "undefined" if not found', () => {
      expect(store.peekCollection('notfound')).toBeUndefined();
    });

    it('should not fetch a collection from the adapter', (done) => {
      store.loadCollection('collection').then(c => {
        requestCount = 0;
        store.peekCollection('collection');
        expect(requestCount).toBe(0);
        done();
      });
    });
  });

  describe('.findCollection', () => {
    it('should return a promise', () => {
      expect(store.findCollection('collection') instanceof Promise).toBeTruthy();
    });

    it('should fetch a collection from the adapter if it is not already loaded', (done) => {
      requestCount = 0;
      store.findCollection('collection').then(c => {
        expect(Array.isArray(c)).toBeTruthy();
        expect(c.length).toBe(1);
        expect(c[0] instanceof SBStory).toBeTruthy();
        expect(requestCount).toBe(1);
        done();
      });
    });

    it('should resolve with a collection from the cache if it is already loaded', (done) => {
      requestCount = 0;
      store.findCollection('collection').then(c => {
        store.findCollection('collection').then(c1 => {
          expect(Array.isArray(c1)).toBeTruthy();
          expect(c.length).toBe(1);
          expect(c[0] instanceof SBStory).toBeTruthy();
          expect(requestCount).toBe(1);
          done();
        });
      });
    });

    it('should reject the promise if an error happens', (done) => {
      store.findCollection('error').then(c => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(error).toBeDefined();
        done();
      });
    });
  });

  describe('.reloadCollection', () => {
    it('should return a promise', (done) => {
      store.findCollection('collection').then(s => {
        expect(store.reloadCollection('collection') instanceof Promise).toBeTruthy();
        done();
      });
    });

    it('should fetch the story from the adapter', (done) => {
      requestCount = 0;
      store.findCollection('collection').then(s => {
        expect(requestCount).toBe(1);
        store.reloadCollection('collection').then(c1 => {
          expect(requestCount).toBe(2);
          expect(c1).toBe(store.peekCollection('collection'));
          done();
        });
      });
    });

    it('should reject the promise if an error happens', (done) => {
      store.reloadCollection('error').then(s => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(error).toBeDefined();
        done();
      });
    });
  });

  describe('.collection', () => {
    it('should return an observable', () => {
      expect(store.collection('collection') instanceof Observable).toBeTruthy();
    });

    it('should be subscribable and resolve a collection', (done) => {
      store.collection('collection').subscribe(c => {
        expect(Array.isArray(c)).toBeTruthy();
        expect(c.length).toBe(1);
        expect(c[0] instanceof SBStory).toBeTruthy();
        done();
      });
    });

    it('should call the error callback when thrown', (done) => {
      store.collection('error').subscribe(c => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(!!error).toBeTruthy();
        done();
      });
    });

    it('should call next on the observer if collection changes', (done) => {
      var count = 0;
      store.collection('collection').subscribe(c => {
        count++;
        if (count === 1) {
          store.reloadCollection('collection');
        } else {
          expect(count).toBe(2);
          done();
        }
      });
    });
  });
});
