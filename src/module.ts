/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { NgModule, ModuleWithProviders, Provider } from '@angular/core';
import { HttpModule } from '@angular/http';
import { SBOutlet } from './directives/outlet';
import { SBConfig, SB_CONFIG } from './config';
import { SBSerializer, SBDefaultSerializer } from './db/serializer';
import { SBAdapter, SBHttpAdapter } from './db/adapter';
import { SBStore, SBDefaultStore } from './db/store';
import { StoryblokRef, STORYBLOK } from './sdk';

export const SB_PROVIDERS: Provider[] = [
  StoryblokRef,
  { provide: STORYBLOK, useExisting: StoryblokRef },
  { provide: SBAdapter, useClass: SBHttpAdapter },
  { provide: SBSerializer, useClass: SBDefaultSerializer },
  { provide: SBStore, useClass: SBDefaultStore }
];

/**
 * Provides Storyblok Services and Directives
 *
 * @export
 * @class SbModule
 */
@NgModule({
  imports: [HttpModule],
  declarations: [SBOutlet],
  exports: [SBOutlet],
})
export class SBModule {
  static forRoot(config: SBConfig): ModuleWithProviders {
    if (typeof config.accessToken !== 'string' || !config.accessToken.length)
      throw new TypeError('Access Token is not provided in the config!');

    return {
      ngModule: SBModule,
      providers: [
        SB_PROVIDERS,
        { provide: SB_CONFIG, useValue: config },
      ]
    };
  }
}
