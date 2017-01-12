import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { SBStory } from './model';
import { SBStore } from './store';

/**
 * A representation of any set of SBStory over any amount of time.
 * In addition to default RxJS Observables, it does also provide
 * functionality for removing and saving stories.
 *
 * @export
 * @class SBStoryObservable
 * @extends {Observable<SBStory>}
 */
export class SBStoryObservable extends Observable<SBStory> {

  private _story: SBStory;
  private _store: SBStore;

  get $story() { return this._story; }

  /**
   * Creates an instance of SBStoryObservable.
   *
   * @param {Function} [subscribe] the function that is  called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   * @param {SBStore} [store]
   * @param {SBStory} [story]
   *
   * @memberOf SBStoryObservable
   */
  constructor(subscribe?: (subscriber: Subscriber<SBStory>) => Subscription | Function | void,
    store?: SBStore, story?: SBStory) {
    super(subscribe);
    this._store = store;
    this._story = story;
  }

  /**
   * Creates a new cold Observable by calling the SBStoryObservable constructor
   *
   * @static
   * @param {Function} [subscribe] the subscriber function to be passed
   * to the Observable constructor.
   * @param {SBStore} [store]
   * @param {SBStory} [story]
   * @returns
   *
   * @memberOf SBStoryObservable
   */
  static create(subscribe?: (subscriber: Subscriber<SBStory>) => Subscription | Function | void,
    store?: SBStore, story?: SBStory) {
    return new SBStoryObservable(subscribe, store, story);
  }

  /**
   * Creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   *
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @returns {SBStoryObservable} a new observable with the Operator applied
   *
   * @memberOf SBStoryObservable
   */
  lift(operator: Operator<SBStory, SBStory>): SBStoryObservable {
    const observable = new SBStoryObservable();
    observable.source = this;
    observable.operator = operator;
    observable._story = this.$story;
    return observable;
  }

  /* unimplemented - will change in the future */
  save() {
    throw new Error('Not yet implemented');
  }

  /* unimplemented - will change in the future */
  remove() {
    throw new Error('Not yet implemented');
  }
}
