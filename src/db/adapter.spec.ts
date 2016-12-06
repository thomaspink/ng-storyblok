/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';
import { Http, RequestOptionsArgs, Response, ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
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
var requestCount = 0;

export class HttpMock {
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    requestCount++;
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(new Response(new ResponseOptions({
          body: url.indexOf('collection') !== -1 ? collectionPayload : storyPayload,
          status: 200
        })));
      }, 100);
    });
  }
}

describe('SBHttpAdapter', () => {
  var adapter: SBAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SBModule.forRoot({ accessToken: 'token' })],
      providers: [
        // Provided SBHttpAdapter so we are not depending on the adapter
        // the module provides and we can be sure it is the right one
        { provide: SBAdapter, useClass: SBHttpAdapter },
        { provide: Http, useClass: HttpMock }
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
    it('should fetch a story payload', (done) => {
      adapter.fetchStory('story').then(v => {
        expect(v).toBe(storyPayload);
        done();
      });
    });

    it('should fetch once when multiple calls happen', () => {
      requestCount = 0;
      adapter.fetchStory('story');
      adapter.fetchStory('story');
      expect(requestCount).toBe(1);
    });
  });

  describe('.fetchCollection', () => {
    it('should fetch a collection payload', (done) => {
      adapter.fetchCollection('collection').then(c => {
        expect(c).toBe(collectionPayload.stories);
        done();
      });
    });

    it('should fetch once when multiple calls happen', () => {
      requestCount = 0;
      adapter.fetchCollection('collection');
      adapter.fetchCollection('collection');
      expect(requestCount).toBe(1);
    });
  });

});
