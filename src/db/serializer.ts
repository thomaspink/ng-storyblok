/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { SBStory } from './model';

@Injectable()
export abstract class SBSerializer {
  abstract normalizeStory(): Promise<SBStory>;
  abstract normalizeComponent(): Promise<SBStory>;
}

@Injectable()
export class SBDefaultSerializer implements SBSerializer {
  normalizeStory() {
    return null;
  }
  normalizeComponent() {
    return null;
  }
}