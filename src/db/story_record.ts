import { SBRecord } from './record';
import { SBStory } from './model';

export enum SBStoryVersion {
  Published,
  Draft
}

export class SBStoryRecord extends SBRecord<SBStory, SBStoryRecord> {

  protected _versionAtThisLevel: SBStoryVersion = SBStoryVersion.Published;

  /** Reference to the latest loaded story */
  get $story(): SBStory {
    if (this.closed) {
      throw new StoryUnsubscribedError();
    }
    return this._value;
  }

  /**
   * Should be a friend property.
   * Proposal for Typescript is under consideration
   * https://github.com/Microsoft/TypeScript/issues/7692
   *
   * As a fallback for now use `record['_version']` as suggested in
   * the issue.
   *
   * @internal
   */
  protected get _version(): SBStoryVersion {
    return this._parent ? this._parent._version : this._versionAtThisLevel;
  }
  protected set _version(value: SBStoryVersion) {
    if (this._parent) {
      this._parent._version = value;
    } else {
      this._versionAtThisLevel = value;
    }
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
