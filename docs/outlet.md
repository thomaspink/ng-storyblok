# Outlet

The SBOutlet Directive acts as a placeholder for dynamically creating components based on a provided list.

## How to use
Place the `sb-outlet` tag in your components template where child components should be created. 
Provide a list of components (maybe loaded from the [store](store.md)) to the outlet by a property named "model".

*home.component.html*
```html
<sb-outlet [model]="myComponents"></sb-outlet>
```
*home.component.ts*
```ts
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  myComponents: SBComponent[] = [];

  constructor(private _store: SBStore) {
    this.myComponents = this._store.peekStory('home').content.model.childComponents;
  }

}
```
In this case we are peeking the "home" story from the store (we are assuming the story is already loaded)
and then setting myComponents with the `childComponents` property on the content component.    
* `this._store.peekStory('home')` = story
* `this._store.peekStory('home').content` = the root component of the story
* `this._store.peekStory('home').content.model` = the model object of the root component where all the properties are located
* `this._store.peekStory('home').content.model.childComponents` = list of child component, located in the `childComponents` property in the root component

## The components map
But how does the outlet know which components to load based on the key, storyblok provides?   
To make it work we have to provide a map, where we tell the outlets the relationship between the storyblok component key and the actual angular component class.
We do this in the SBModule configuration object.   

The second part we need to do, is to tell the Angular2 compiler to compile and ship those dynamically created components. 
This is necessary, because those components are not imported or declard in other components, the are created dynamically. 
So the compiler does not know out of the box that those components are part of your application. 
To do this, we need to add those components to the `entryComponents` array in the `@NgModule` declaration.
```ts
... other imports
import { PageIntroComponent } from './components/page-intro/page-intro.component';
import { NewsListComponent } from './components/news-list/news-list.component';

export function storyblockConfigFactory() {
  return {
    accessToken: '[[YOUR_PUBLIC_SB_ACCESS_TOKEN]]',
    map: {
      'intro': PageIntroComponent,
      'NewsList': NewsListComponent
    }
  };
}

@NgModule({
  declarations: [
    ...
    PageIntroComponent,
    NewsListComponent
  ],
  imports: [
    ...
    SBModule.forRoot(storyblockConfigFactory)
  ],
  ...
  entryComponents: [PageIntroComponent, NewsListComponent]
})
export class AppModule { }
