import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { SBStory } from './model';

export class SBStoryObservable extends Observable<SBStory> {
  constructor(subscribe?: (subscriber: Subscriber<SBStory>) => Subscription | Function | void,
    story?: SBStory) {
    super(subscribe);
  }

  save() {
    throw new Error('Not yet implemented');
  }

  remove() {
    throw new Error('Not yet implemented');
  }
}
