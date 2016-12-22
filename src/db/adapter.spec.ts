/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';
import { Http, RequestOptionsArgs, Response, ResponseOptions, ResponseType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { SBModule } from '../module';
import { SBAdapter, SBHttpAdapter } from './adapter';

export const storyPayload = {
  story: {
    name: 'Home',
    created_at: '2016-11-01T14:15:58.201Z',
    published_at: '2016-11-16T14:18:24.589Z',
    alternates: [],
    id: 41107,
    content: {
      '_uid': '6fecdd7e-7734-4bb4-a639-5ccbc5eebc68',
      'component': 'root'
    },
    slug: 'home',
    full_slug: 'home',
    sort_by_date: null,
    tag_list: []
  }
};
export const collectionPayload = { stories: [storyPayload.story] };

export class HttpMock {
  constructor(private onRequest: (url, options) => void = function () { }) { };
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    this.onRequest(url, options);
    return new Observable((observer: Observer<any>) => {
      setTimeout(() => {
        if (url.indexOf('error') === -1) {
          observer.next(new Response(new ResponseOptions({
            body: url.indexOf('collection') !== -1 ? collectionPayload : storyPayload,
            status: 200
          })));
        } else {
          observer.error(new Response(new ResponseOptions({
            body: 'error',
            type: ResponseType.Error,
            status: 404,
            statusText: 'not found',
          })));
        }
      }, 100);
    });
  }
}

export function HttpMockFactory(onRequest?: (url, options) => void) {
  return new HttpMock(onRequest);
}

var requestCount = 0;
describe('SBHttpAdapter', () => {
  var adapter: SBAdapter;

  beforeEach(() => {

    function storyblockConfigFactory() {
      return {
        accessToken: 'token'
      };
    }
    TestBed.configureTestingModule({
      imports: [SBModule.forRoot(storyblockConfigFactory)],
      providers: [
        // Provided SBHttpAdapter so we are not depending on the adapter
        // the module provides and we can be sure it is the right one
        { provide: SBAdapter, useClass: SBHttpAdapter },
        { provide: Http, useValue: HttpMockFactory(() => requestCount++) }
      ]
    });

    inject([SBAdapter], (_adapter: SBAdapter) => {
      adapter = _adapter;
    })();
  });

  it('should be injectable by the token SBAdapter', () => {
    expect(adapter instanceof SBHttpAdapter).toBeTruthy();
  });

  it('does implement SBSerializer', () => {
    expect(typeof adapter.fetchStory).toBe('function');
    expect(typeof adapter.fetchCollection).toBe('function');
  });

  describe('.fetchStory', () => {
    it('should fetch a story', (done) => {
      adapter.fetchStory('story').then(v => {
        expect(v).toBe(storyPayload);
        done();
      });
    });

    it('should fetch only once when multiple calls are pending at the same time', () => {
      requestCount = 0;
      adapter.fetchStory('story');
      adapter.fetchStory('story');
      expect(requestCount).toBe(1);
    });

    it('should call the error callback', (done) => {
      adapter.fetchStory('error').then(v => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(true).toBeTruthy();
        done();
      });
    });
  });

  describe('.fetchCollection', () => {
    it('should fetch a collection of stories', (done) => {
      adapter.fetchCollection('collection').then(c => {
        expect(c).toBe(collectionPayload.stories);
        done();
      });
    });

    it('should fetch only once when multiple calls are pending at the same time', () => {
      requestCount = 0;
      adapter.fetchCollection('collection');
      adapter.fetchCollection('collection');
      expect(requestCount).toBe(1);
    });

    it('should call the error callback', (done) => {
      adapter.fetchCollection('error').then(v => {
        expect(false).toBeTruthy();
        done();
      }, error => {
        expect(true).toBeTruthy();
        done();
      });
    });
  });

});
