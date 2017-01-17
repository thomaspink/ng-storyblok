import { SBRecord } from './record';
import { SBStory } from './model';

export class SBStoryRecord extends SBRecord<SBStory> {

  /** Reference to the latest loaded story */
  get $story() {
    if (this.closed) {
      throw new StoryUnsubscribedError();
    }
    return this._value;
  }

  /* unimplemented - will change in the future */
  save(): void {
    throw new MethodNotAvailableError();
  }

  /* unimplemented - will change in the future */
  remove(): void {
    throw new MethodNotAvailableError();
  }
}

export class StoryUnsubscribedError extends Error {
  constructor() {
    const err: any = super('story unsubscribed');
    (<any>this).name = err.name = 'StoryUnsubscribedError';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}

export class MethodNotAvailableError extends Error {
  constructor() {
    const err: any = super('method not yet available');
    (<any>this).name = err.name = 'MethodNotAvailableError';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}
