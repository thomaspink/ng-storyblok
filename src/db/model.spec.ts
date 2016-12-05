/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { SBComponent, SBStory } from './model';

const component = new SBComponent({
  _uid: 'uid',
  type: 'componenttype',
  model: {
    property1: 1,
    property2: true
  }
});
const story = new SBStory({
      id: 1,
      name: 'name',
      slug: 'slug',
      fullSlug: 'fullSlug',
      created: new Date(),
      published: new Date(),
      alternates: [],
      sortByDate: true,
      tagList: [],
      content: component
    });

describe('Model', () => {
  describe('SBComponent', () => {
    it('Constructor', () => {
      expect(component instanceof SBComponent).toBeTruthy();
      expect(component._uid).toBe('uid');
      expect(component.type).toBe('componenttype');
      expect(typeof component.model).toBe('object');
      expect(component.model.property1).toBe(1);
      expect(component.model.property2).toBe(true);
      expect(component.model.property3).toBe(undefined);
    });
  });

  describe('SBStory', () => {
    it('Constructor', () => {
      expect(story instanceof SBStory).toBeTruthy();
      expect(story.id).toBe(1);
      expect(story.name).toBe('name');
      expect(story.slug).toBe('slug');
      expect(story.fullSlug).toBe('fullSlug');
      expect(story.created instanceof Date).toBeTruthy();
      expect(story.published instanceof Date).toBeTruthy();
      expect(Array.isArray(story.alternates)).toBeTruthy();
      expect(story.sortByDate).toBe(true);
      expect(Array.isArray(story.tagList)).toBeTruthy();
      expect(story.content instanceof SBComponent).toBeTruthy();
      expect(story.content).toBe(component);
    });
  });
});
