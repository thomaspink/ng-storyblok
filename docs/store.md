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

### `story`
Get an Observable on a story by a given slug or ID. When subscribing or switching it to the "hot" state, the method will lookup the story from the store or otherwise fetch it from the adapter. Everytime the story changes, gets updated or reloaded (see `reloadStory`) the Observer will call next with the new resolved story.

### `findStory`
Get a story by a given slug or ID by looking up the story from the store if it is available, otherwise it will trigger a fetch from the server.

This method will asynchronously peek the story from the store. If the story is not present in the store (cache), it will be loaded by the adapters `fetchStory` method.
A story is available if it has been fetched earlier.

#### *Example*
As you can see in this example, we are calling `findStory` with `home` as a slug on the store. The method will return a `Promise` that will be resolved with the story. If you are using `findStory` it does not matter if the story is already loaded or not. The store will try to resolve the story from the local cache or load it from the server if it is not found.
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    this._sb.findStory('home').then((story: SBStory) => {
      // yeah i got data
      console.log(story);
    });
  }
}
```

### `peekStory`
Get a story by a given slug or ID without triggering a fetch.

This method will synchronously return the story if it is available in the store, otherwise it will return `undefined`.
A story is available if it has been fetched earlier.

#### *Example*
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    const story = this._sb.peekStory('home');
    console.log(story); // story is a SBStory if it has been fetched earlier. Otherwise it is undefined
  }
}
```

### `loadStory`
Get a story by a given slug or ID by triggering a fetch on the adapter and loading it fresh from the server.

This method will asynchronously fetch the story from the adapter and return a Promise that will be resolved with the story.

#### *Example*
As you can see below, we are calling `loadStory` with `home` as a slug on the store. The method will then **always load the story from the storyblok server** using the adapter. It returns a promise which will resolve with the story once the fetching has been finished or reject if an error appears. The resolved story will be stored(cached). From now on you can access the story synchronously by using `peekStory`.
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    this._sb.loadStory('home').then((story: SBStory) => {
      // yeah i got data
      console.log(story);
    });
  }
}
```
```


The method will return a `Observable` where you can subscribe on. To get the story you can add a next function to the subscribe method, with will be called with the normalized story as a parameter when the data is loaded. For more information on how `Observables` work, take a look on [RxJS](http://reactivex.io/rxjs/)

From now on the story for "home" is saved in the store, so next time we need this story we can call `peekStory` for loading it directly from the story, without a extra network request:
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    this._sb.findStore('home').subscribe((story: SBStory) => {
      console.log(story);
    });
  }
  someTimeInTheFuture() {
    const story = this._sb.peekStore('home');
    console.log(story);
  }
}
```
