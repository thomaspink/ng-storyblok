/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { SBMessageBus } from './messaging';
import { SBLinker } from './linker';

export { SBMessageBus, SBLinker };

export const SB_LINKER_PROVIDER = [
  SBMessageBus,
  SBLinker
];
