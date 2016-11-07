# The Store 
ng-storyblok provides an injectable store for loading data from the Atoryblok API and storing it. The store uses an Adapter and Serializer to load data as json from the server and normalizing it into a higher level data structure

## Injecting the Store
To use the Store you just inject it into your component or service. 
Make sure, not to include the `SBDfaultStore` or your own implementation directly, just inject `SBStore` and Angular will load the specified one!

First inport `SBStore` into your component or directory.
```ts
import { SBStore } from 'ng-storyblok';
```

Now you can inject the adapter in the constructor function of you component or service class. 
As you can see the adapter is now available in the component by the private property `_sb`.

```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBStore) {  }
}
```

## Loading a story
As we have injected the store into our component, it is now time to load your first story.
To get a story, the store exposes multiple methods:

| method name     | Parameters                          | returns             | Description                                          |
|-----------------|-------------------------------------|---------------------|------------------------------------------------------|
| findStory | slug: string, version*[optional]*: string | Observable<SBStory> | Use `findStory` to retrieve a story by its slug. This will return an Observable that fulfills with the requested record. |
| findStory | id: number, version*[optional]*: string   | Observable<SBStory> | Use `findStory` to retrieve a story by its id. This will return an Observable that fulfills with the requested record. |
| peekStory | slug: string, version*[optional]*: string | SBStory             | Use `peekStory` to retrieve a story by its slug, without making a network request. This will return the story only if it is already present in the store. |
| peekStory | id: number, version*[optional]*: string   | SBStory             | Use `peekStory` to retrieve a story by its id, without making a network request. This will return the story only if it is already present in the store. |

As you can see below, we are calling `findStory` with `home` as a slug on the store. The method will return an `Observable` where you can subscribe on. To get the story you can add a next function to the subscribe method, with will be called with the normalized story as a parameter when the data is loaded. For more information on how `Observables` work, take a look on [RxJS](http://reactivex.io/rxjs/)
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    this._sb.findStore('home').subscribe((story: SBStory) => {
      // yeah i got data
      console.log(story);
    });
  }
}
```
From now on the story for "home" is saved in the store, so next time we need this story we can call `peekStory` for loading it directly from the story, without a extra network request:
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    this._sb.findStore('home').subscribe((story: SBStory) => {
      // yeah i got data
      console.log(story);
    });
  }
  someTimeInTheFuture() {
    const story = this._sb.peekStore('home');
    console.log(story);
  }
}
```
