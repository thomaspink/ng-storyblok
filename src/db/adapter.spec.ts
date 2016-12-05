/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';
import { SBAdapter, SBHttpAdapter } from './adapter';

describe('SBDefaultSerializer', () => {
  var adapter: SBAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SBAdapter, useClass: SBHttpAdapter }]
    });

    inject([SBAdapter], (_adapter: SBAdapter) => {
      adapter = _adapter;
    })();
  });

  it('should be injectable by the token SBSerializer', () => {
    expect(adapter instanceof SBHttpAdapter).toBeTruthy();
  });

  it('does implement SBSerializer', () => {
    expect(typeof adapter.fetchStory).toBe('function');
    expect(typeof adapter.fetchCollection).toBe('function');
  });
});
