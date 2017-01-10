import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export class SubscriberList<T> {
  private _list: Subscriber<T>[] = [];

  create(): Observable<T> {
    return new Observable<T>((sub: Subscriber<T>) => {
      sub.add(() => this.remove(sub));
      this._list.push(sub);
    });
  }

  remove(sub: Subscriber<T>) {
    const index = this._list.indexOf(sub);
    if (index !== -1) {
      this._list.splice(index, 1);
    }
  }

  next(value?: T) {
    this._list.forEach(sub => {
      if (!sub.closed)
        sub.next(value);
    });
  }

  complete() {
    this._list.forEach(sub => sub.complete());
  }
}
