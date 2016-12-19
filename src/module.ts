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
import { SBConfig } from './config';
import { SBSerializer, SBDefaultSerializer } from './db/serializer';
import { SBAdapter, SBHttpAdapter } from './db/adapter';
import { SBStore, SBDefaultStore } from './db/store';

export const SB_PROVIDERS: Provider[] = [
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
  providers: SB_PROVIDERS,
  declarations: [SBOutlet],
  exports: [SBOutlet],
})
export class SBModule {
  static forRoot(configFactory: () => SBConfig): ModuleWithProviders {
    return {
      ngModule: SBModule,
      providers: [
        { provide: SBConfig, useFactory: configFactory},
      ]
    };
  }
}
