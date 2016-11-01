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