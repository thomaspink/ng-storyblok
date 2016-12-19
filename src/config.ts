/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Type, OpaqueToken } from '@angular/core';

export abstract class SBConfig {
  accessToken: string;
  space?: string;
  endPoint?: string;
  type?: 'full' | 'widget';
  map?: {
    [key: string]: Type<any>
  };
}
