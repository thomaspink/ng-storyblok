# Loading Data
ng-storyblok provides injectable high level Adapters for loading data from the Atoryblok API. 
There are two types of Adapters, the `SBSdkAdapter` and `SBHttpAdapter` build into ng-storyblok but it is easy to create your own.
The difference between those two Adapters is that the `SBSdkAdapter` has a dependency on the Storyblok SDK and needs it to load data. 
The `SBHttpAdapter` does not need the SDK, it loads the data directly from the API endpoint using the Angular2 Http Module. 
By default the `SBSdkAdapter` is provided.

## Injecting the Adapter
To Use the Adapter you just inject it into your component. 
Make sure not to include the `SBSdkAdapter`, the `SBHttpAdapter` or your own directly in your component or service.
Just inject `SBAdapter`and Angular will load the specified one!

First inport `SBAdapter` into your component or directory.
```ts
import { SBAdapter } from 'ng-storyblok';
```

Now you can inject the adapter in the constructor function of you component or service class. 
As you can see the adapter is now available in the component by the private property `_sb`.

```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {  }
}
```

## Loading a story
As we have injected the adapter into our component, it is now time to load your first story.
To get a story, the adapter exposes multiple methods:

| method name     | Parameters                                | returns             | Description                                          |
|-----------------|-------------------------------------------|---------------------|------------------------------------------------------|
| loadStoryBySlug | slug: string, version*[optional]*: string | Observable<SBStory> |Loads the Story from the storyblok API by the slug and serializes it |
| loadStoryById   | id: number, version*[optional]*: string   | Observable<SBStory> |Loads the Story from the storyblok API by the id and serializes it. |
| getStoryBySlug  | slug: string, version*[optional]*: string | Observable<SBStory> |Gets the Story from the cache by the slug. If story is not yet there, it will load it by calling `loadStoryBySlug`. |
| getStoryById    | id: string, version*[optional]*: string   | Observable<SBStory> |Gets the Story from the cache by the id. If story is not yet there, it will load it by calling `loadStoryById`. |

As you can see below, we are calling `loadStoryBySlug` with `home` as a slug ont the adapter. The method will return an `Observable` where you can subscribe on. To get the story you can add a next function to the subscribe method, with will be called with the normalized story as a parameter when the data is loaded. For more information on how `Observables` work, take a look on [RxJS](http://reactivex.io/rxjs/)
```ts
@Component({
  selector: 'my-component',
  ...
})
export class MyComponent {
  constructor(private _sb: SBAdapter) {
    this._sb.loadStoryBySlug('home').subscribe((story: SBStory) => {
    });
  }
}
```
