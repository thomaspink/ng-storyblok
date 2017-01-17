import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { Observer, PartialObserver } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

export class SBRecord<T> extends Subject<T> {

  protected _valueOnThisLevel: T;
  protected _parentRecord: SBRecord<T>;

  /* @internal */
  protected get _value() {
    return this._parentRecord ? this._parentRecord._value : this._valueOnThisLevel;
  }
  protected set _value(value: T) {
    if (this._parentRecord) {
      this._parentRecord._value = value;
    } else {
      this._valueOnThisLevel = value;
    }
  }

  /* @internal */
  get _parent() { return this._parentRecord; }
  set _parent(value: SBRecord<T>) {
    if (this._parentRecord) {
      throw new ParentAlreadyExistsError();
    }
    this._valueOnThisLevel = undefined;
    this._parentRecord = value;
    this._parentRecord.subscribe(
      val => super.next(val),
      err => super.error(err),
      () => super.complete());
  }

  /**
   * Creates an instance of SBRecord with an optional value.
   *
   * @param {SBStory} [story]
   * @memberOf SBRecord
   */
  constructor(value?: T) {
    super();
    if (value) {
      this._value = value;
    }
  }

  /**
   * Creates a new SBRecord.
   * Same as `new SBRecord(story)`
   *
   * @static
   * @param {SBStory} [story]
   * @returns {SBRecord}
   * @memberOf SBRecord
   */
  static create<T>(value?: T): SBRecord<T> {
    return new SBRecord<T>(value);
  }

  /**
   * Creates a new SBRecord, with this instance as the source,
   * and the passed operator defined as the new operator.
   *
   * @param {Operator<SBStory, SBStory>} operator
   * @returns {SBRecord}
   * @memberOf SBRecord
   */
  lift(operator: Operator<T, T>): Observable<T> {
    const observable = this.asObservable();
    (<any>observable).operator = operator;
    return observable;
  }

  /**
   * The callback to receive notifications of type `next` from with a value.
   * This method may be called 0 or more times.
   *
   * @param {T} [value] The `next` value.
   * @return {void}
   * @memberOf SBRecord
   */
  next(value: T): void {
    if (this.closed) {
      throw new UnsubscribedError();
    }
    if (this._parentRecord) {
      this._parentRecord.next(value);
    } else {
      this._value = value;
    }
    super.next(value);
  }

  /**
   * The callback to receive notifications of type `error` with an attached Error.
   * Notifies that it has experienced an error condition.
   *
   * @param {any} [err] The `error` exception.
   * @return {void}
   * @memberOf SBRecord
   */
  error(err: any): void {
    if (this.closed) {
      throw new UnsubscribedError();
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
   * @memberOf SBRecord
   */
  subscribe(): Subscription;
  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(next?: (value: T) => void,
    error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(observerOrNext?: PartialObserver<T> |
    ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription {
    return this._parentRecord ? this._parentRecord.subscribe.apply(this._parentRecord, arguments) :
      super.subscribe.apply(this, arguments);
  }

  /**
   * Disposes the resources. May, for instance, cancel an ongoing Observable execution
   * or cancel any other type of work that started when it was created.
   *
   * @return {void}
   * @memberOf SBRecord
   */
  unsubscribe(): void {
    this._valueOnThisLevel = undefined;
    super.unsubscribe();
  }

  /**
   * Retuns an observable with this record as a source.
   *
   * @returns {Observable<T>}
   * @memberOf SBRecord
   */
  asObservable(): Observable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this._parentRecord || this;
    return observable;
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

export class UnsubscribedError extends Error {
  constructor() {
    const err: any = super('unsubscribed');
    (<any>this).name = err.name = 'UnsubscribedError';
    (<any>this).stack = err.stack;
    (<any>this).message = err.message;
  }
}
