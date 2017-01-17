import { SBRecord } from './record';
import { SBStory } from './model';
import { SBStoryRecord } from './story_record';

export class SBCollectionRecord extends SBRecord<SBStoryRecord[]> {

  private _pathOnThisLevel: string;

  get path() {
    return this._parent ? (<SBCollectionRecord>this._parent).path : this._pathOnThisLevel;
  }
  set path(value: string) {
    if (this.path) {
      throw new PathAlreadySetError();
    }
    if (this._parent) {
      (<SBCollectionRecord>this._parent).path = value;
    } else {
      this._pathOnThisLevel = value;
    }
  }

  /** Reference to the latest loaded story */
  get $collection() {
    if (this.closed) {
      throw new CollectionUnsubscribedError();
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

export class CollectionUnsubscribedError extends Error {
  constructor() {
    const err: any = super('story unsubscribed');
    (<any>this).name = err.name = 'CollectionUnsubscribedError';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}

export class PathAlreadySetError extends Error {
  constructor() {
    const err: any = super('path has already been set');
    (<any>this).name = err.name = 'PathAlreadySetError';
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
