/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';
import { SBDefaultSerializer, SBSerializer } from './serializer';
import { SBComponent, SBStory } from './model';
import { storyPayload } from './adapter.spec';

const storyPayloay1 = JSON.stringify(storyPayload.story);
const storyPayloay2 = `{"story": ${storyPayloay1}}`;
const componentPayload = `{
  "_uid": "2c9ade1f-b6f2-4257-8227-17fef2749216",
  "text": "some text",
  "headline": "some text",
  "component": "intro"
}`;


describe('SBDefaultSerializer', () => {
  var serializer: SBSerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:  [{ provide: SBSerializer, useClass: SBDefaultSerializer }]
    });

    inject([SBSerializer], (_serializer: SBSerializer) => {
      serializer = _serializer;
    })();
  });

  it('should be injectable by the token SBSerializer', () => {
    expect(serializer instanceof SBDefaultSerializer).toBeTruthy();
  });

  it('does implement SBSerializer', () => {
    expect(typeof serializer.normalizeStory).toBe('function');
    expect(typeof serializer.normalizeComponent).toBe('function');
    expect(typeof serializer.normalizeBlok).toBe('function');
    expect(typeof serializer.normalizeCollection).toBe('function');
  });

  describe('.normalizeStory', () => {
    it(' should normalize a story from string payload ', () => {
      const result1 = serializer.normalizeStory(storyPayloay1);
      const result2 = serializer.normalizeStory(storyPayloay2);
      expect(result1 instanceof SBStory).toBeTruthy();
      expect(result1.content instanceof SBComponent).toBeTruthy();
      expect(result2 instanceof SBStory).toBeTruthy();
      expect(result2.content instanceof SBComponent).toBeTruthy();
    });
    it('should normalize a story from object payload ', () => {
      const result1 = serializer.normalizeStory(JSON.parse(storyPayloay1));
      const result2 = serializer.normalizeStory(JSON.parse(storyPayloay2));
      expect(result1 instanceof SBStory).toBeTruthy();
      expect(result1.content instanceof SBComponent).toBeTruthy();
      expect(result2 instanceof SBStory).toBeTruthy();
      expect(result2.content instanceof SBComponent).toBeTruthy();
    });
    it('should throw an error if payload is not a valid story', () => {
      expect(() => serializer.normalizeStory('{}')).toThrow();
      expect(() => serializer.normalizeStory('{id:1}')).toThrow();
      expect(() => serializer.normalizeStory('{"id":1,"slug":"sadf"}')).toThrow();
      expect(() => serializer.normalizeStory('{"id":1,"name":"sadf"}')).toThrow();
    });
  });

  describe('.normalizeComponent', () => {
    it(' should normalize a component from string payload ', () => {
      const result = serializer.normalizeComponent(componentPayload);
      expect(result instanceof SBComponent).toBeTruthy();
      expect(result._uid).toBe('2c9ade1f-b6f2-4257-8227-17fef2749216');
      expect(result.type).toBe('intro');
      expect(typeof result.model).toBe('object');
      expect(result.model.text).toBe('some text');
    });
    it('should normalize a component from object payload ', () => {
      const result = serializer.normalizeComponent(JSON.parse(componentPayload));
      expect(result instanceof SBComponent).toBeTruthy();
      expect(result._uid).toBe('2c9ade1f-b6f2-4257-8227-17fef2749216');
      expect(result.type).toBe('intro');
      expect(typeof result.model).toBe('object');
      expect(result.model.text).toBe('some text');
    });
    it('should throw an error if payload is not a valid component', () => {
      expect(() => serializer.normalizeComponent('{}')).toThrow();
      expect(() => serializer.normalizeComponent('{"_uid": "a"}')).toThrow();
      expect(() => serializer.normalizeComponent('{"component":"intro"}')).toThrow();
    });
  });

  describe('.normalizeBlok', () => {
    it(' should normalize a blok from string payload ', () => {
      const result = serializer.normalizeBlok(`[${componentPayload}]`);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0] instanceof SBComponent).toBeTruthy();
      expect(result[0]._uid).toBe('2c9ade1f-b6f2-4257-8227-17fef2749216');
    });
    it('should normalize a blok from object payload ', () => {
      const result = serializer.normalizeBlok(JSON.parse(`[${componentPayload}]`));
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0] instanceof SBComponent).toBeTruthy();
      expect(result[0]._uid).toBe('2c9ade1f-b6f2-4257-8227-17fef2749216');
    });
    it('should throw an error if payload is not a valid blok', () => {
      expect(() => serializer.normalizeBlok('{}')).toThrow();
    });
  });

  describe('.normalizeCollection', () => {
    it(' should normalize a collection from string payload ', () => {
      const result = serializer.normalizeCollection(`[${storyPayloay1}]`);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0] instanceof SBStory).toBeTruthy();
      expect(result[0].id).toBe(41107);
    });
    it('should normalize a collection from object payload ', () => {
      const result = serializer.normalizeCollection(JSON.parse(`[${storyPayloay1}]`));
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0] instanceof SBStory).toBeTruthy();
      expect(result[0].id).toBe(41107);
    });
    it('should throw an error if payload is not a valid blok', () => {
      expect(() => serializer.normalizeCollection('{}')).toThrow();
    });
  });

});
