import { SBDefaultSerializer } from './serializer';
import { SBComponent, SBStory } from './model';

const serializer = new SBDefaultSerializer();
const storyPayloay = `{
  "story": {
    "name": "Home",
    "created_at": "2016-11-01T14:15:58.201Z",
    "published_at": "2016-11-16T14:18:24.589Z",
    "alternates": [],
    "id": 41107,
    "content": {
      "_uid": "6fecdd7e-7734-4bb4-a639-5ccbc5eebc68",
      "component": "root"
    },
    "slug": "home",
    "full_slug": "home",
    "sort_by_date": null,
    "tag_list": []
  }
}`;

describe('SBDefaultSerializer', () => {

  describe('constructor', () => {
    it('does implement SBSerializer', () => {
      expect(typeof serializer.normalizeStory).toBe('function');
      expect(typeof serializer.normalizeComponent).toBe('function');
      expect(typeof serializer.normalizeBlok).toBe('function');
      expect(typeof serializer.normalizeCollection).toBe('function');
    });
  });

  describe('normalizeStory', () => {
    it('normalize story from string payload ', () => {
      const result = serializer.normalizeStory(storyPayloay);
      expect(result instanceof SBStory).toBe(true);
      expect(result.content instanceof SBComponent).toBe(true);
    });
    it('normalize story from object payload ', () => {
      const result = serializer.normalizeStory(JSON.parse(storyPayloay));
      expect(result instanceof SBStory).toBe(true);
      expect(result.content instanceof SBComponent).toBe(true);
    });
  });

});
