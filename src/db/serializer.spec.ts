import { SBDefaultSerializer } from './serializer';

describe('SBDefaultSerializer', () => {
  describe('constructor', () => {

    it('can be created', () => {
      expect(new SBDefaultSerializer() instanceof SBDefaultSerializer).toBe(true);
    });

  });
});
