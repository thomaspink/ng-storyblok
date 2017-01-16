import { SBRecord } from './record';
import { SBStory } from './model';
import { SBStoryRecord } from './story_record';

export class SBCollectionRecord extends SBRecord<SBStoryRecord[]> {

  /** Reference to the latest loaded story */
  get $collection() {
    if (this.closed) {
      throw new CollectionUnsubscribedError();
    }
    return this._value;
  }

  /* unimplemented - will change in the future */
  save(): void {
    throw new MethodNotAvailable();
  }

  /* unimplemented - will change in the future */
  remove(): void {
    throw new MethodNotAvailable();
  }
}

export class CollectionUnsubscribedError extends Error {
  constructor() {
    const err: any = super('story unsubscribed');
    (<any>this).name = err.name = 'CollectionUnsubscribedError';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}

export class MethodNotAvailable extends Error {
  constructor() {
    const err: any = super('method not yet available');
    (<any>this).name = err.name = 'MethodNotAvailable';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}
