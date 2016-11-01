/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

export abstract class SBStory {
  id: number;
  name: string;
  slug: string;
  fullSlug: string;
  created: Date;
  published: Date;
  alternates: any[];
  sortByDate: any;
  tagList: any[];
}