import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { Observer, PartialObserver } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { SBStory } from './model';
import { SBStore } from './store';

export class SBStoryRecord extends Subject<SBStory> {

  private _storyOnThisLevel: SBStory;
  private _parentRecord: SBStoryRecord;

  /* @internal */
  get _parent() { return this._parentRecord; }
  set _parent(value: SBStoryRecord) {
    if (this._parentRecord) {
      throw new ParentAlreadyExistsError();
    }
    this._storyOnThisLevel = undefined;
    this._parentRecord = value;
    this._parentRecord.subscribe(
      story => super.next(story),
      err => super.error(err),
      () => super.complete());
  }

  /* @internal */
  protected get _story() {
    return this._parentRecord ? this._parentRecord.$story : this._storyOnThisLevel;
  }
  protected set _story(value: SBStory) {
    if (this._parentRecord) {
      this._parentRecord._story = value;
    } else {
      this._storyOnThisLevel = value;
    }
  }

  /** Reference to the latest loaded story */
  get $story() {
    if (this.closed) {
      throw new StoryUnsubscribedError();
    }
    return this._story;
  }

  /**
   * Creates an instance of SBStoryRecord with an optional story.
   *
   * @param {SBStory} [story]
   * @memberOf SBStoryRecord
   */
  constructor(story?: SBStory) {
    super();
    if (story) {
      this._story = story;
    }
  }

  /**
   * Creates a new SBStoryRecord.
   * Same as `new SBStoryRecord(story)`
   *
   * @static
   * @param {SBStory} [story]
   * @returns {SBStoryRecord}
   * @memberOf SBStoryRecord
   */
  static create(story?: SBStory): SBStoryRecord {
    return new SBStoryRecord(story);
  }

  /**
   * Creates a new SBStoryRecord, with this instance as the source,
   * and the passed operator defined as the new operator.
   *
   * @param {Operator<SBStory, SBStory>} operator
   * @returns {SBStoryRecord}
   * @memberOf SBStoryRecord
   */
  lift(operator: Operator<SBStory, SBStory>): SBStoryRecord {
    const subject = new SBStoryRecord();
    subject.source = this._parentRecord || this;
    subject.operator = operator;
    subject._story = this._story;
    return subject;
  }

  /**
   * The callback to receive notifications of type `next` from with a value.
   * This method may be called 0 or more times.
   *
   * @param {SBStory} [story] The `next` value.
   * @return {void}
   * @memberOf SBStoryRecord
   */
  next(story: SBStory): void {
    if (this.closed) {
      throw new StoryUnsubscribedError();
    }
    if (this._parentRecord) {
      this._parentRecord.next(story);
    } else {
      this._story = story;
    }
    super.next(story);
  }

  /**
   * The callback to receive notifications of type `error` with an attached Error.
   * Notifies that it has experienced an error condition.
   *
   * @param {any} [err] The `error` exception.
   * @return {void}
   * @memberOf SBStoryRecord
   */
  error(err: any): void {
    if (this.closed) {
      throw new StoryUnsubscribedError();
    }
    if (this._parentRecord) {
      this._parentRecord.error(err);
    }
    super.error(err);
  }

  /**
   * The callback to receive a valueless notification of type `complete`.
   * Notifies that it has finished sending push-based notifications.
   * @return {void}
   */
  complete(): void {
    super.complete();
    this._parentRecord.complete();
  }

  /**
   * Registers handlers for handling emitted values, error and completions from the observable, and
   * executes the observable's subscriber function, which will take action to set up the underlying
   * data stream
   *
   * @param {PartialObserver|Function} [observerOrNext] either an observer defining all functions
   * to be called, or the first of three possible handlers, which is the handler for each value
   * emitted from the observable.
   * @param {Function} [error] handler for a terminal event resulting from an error.
   * If no error handler is provided, the error will be thrown as unhandled
   * @param {Function} [complete] handler for a terminal event resulting from successful completion.
   * @return {ISubscription} a subscription reference to the registered handlers
   * @memberOf SBStoryRecord
   */
  subscribe(): Subscription;
  subscribe(observer: PartialObserver<SBStory>): Subscription;
  subscribe(next?: (value: SBStory) => void,
    error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(observerOrNext?: PartialObserver<SBStory> |
    ((value: SBStory) => void), error?: (error: any) => void, complete?: () => void): Subscription {
    return this._parentRecord ? this._parentRecord.subscribe.apply(this._parentRecord, arguments) :
      super.subscribe.apply(this, arguments);
  }


  /**
   * Disposes the resources. May, for instance, cancel an ongoing Observable execution
   * or cancel any other type of work that started when it was created.
   *
   * @return {void}
   * @memberOf SBStoryRecord
   */
  unsubscribe(): void {
    this._storyOnThisLevel = undefined;
    super.unsubscribe();
  }

  /**
   * Retuns an observable with this record as a source.
   *
   * @returns {Observable<SBStory>}
   * @memberOf SBStoryRecord
   */
  asObservable(): Observable<SBStory> {
    const observable = new Observable<SBStory>();
    (<any>observable).source = this._parentRecord || this;
    return observable;
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

export class StoryUnsubscribedError extends Error {
  constructor() {
    const err: any = super('story unsubscribed');
    (<any>this).name = err.name = 'StoryUnsubscribedError';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}

export class ParentAlreadyExistsError extends Error {
  constructor() {
    const err: any = super('parent already exists');
    (<any>this).name = err.name = 'ParentAlreadyExistsError';
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
