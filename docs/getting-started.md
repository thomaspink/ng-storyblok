# Getting started

Before getting started, please make sure ng-storyblok is installed as described in the [Readme](https://github.com/thomaspink/ng-storyblok).

## The NgModule
ng-storyblok provides a NgModule called `SBModule` that has to be imported in your AppModule file.
`src/app/app.module.ts`
```ts
import { SBModule } from 'ng-storyblok';
```

Now you have to add the imported `SBModule` to the imports array in your AppModule and call the `forRoot` method with a configuration factory function.
```ts
export function storyblockConfigFactory() {
  return {
    // your config goes here
  };
}

@NgModule({
  imports: [
    SBModule.forRoot(storyblockConfigFactory)
  ],
  ...
})
export class MyAppModule { }
```
## Configuration
The configuration consists of the following properties:

| Key                         | Type      | Description                                                                |
|-----------------------------|-----------|----------------------------------------------------------------------------|
| accessToken *[required]* | string    | public access token for making requests to the storyblok api. You can grab it in the storyblok backend. |
| space *[optional]*       | string    | The id of your storyblok space. Get it in the storyblok backend            |
| endPoint *[optional]*    | string    | The endpoint of the storyblok API. You normally don't have to change this. |
| type *[optional]*        | string    | Defines how storyblok wraps your app in edit mode. Possible values are "full" and "widget". Default is "full". |
| map *[optional]*         | object    | Defines the relationship of a storyblok component to an angular component type. Is only needed if you are using the sb-outlet directive. |

**In code:**
```ts
...
{
  accessToken: '[[YOUR_PUBLIC_SB_ACCESS_TOKEN]]';
  space: '[[YOUR_SB_SPACE_ID]]';
  endPoint: 'https://the.storyblok.com/api/endpoint';
  type: 'full';
  map: {
    'SB-Component-Name': MyComponent
  }
}
...
```

## When it comes together
The full AppModule with ng-storyblok.
```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { SBModule } from 'ng-storyblok';

import { AppComponent } from './app.component';

export function storyblockConfigFactory() {
  return {
    accessToken: '[[YOUR_PUBLIC_SB_ACCESS_TOKEN]]'
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SBModule.forRoot(storyblockConfigFactory)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
## Example
You can have a look at the [ng-storyblok-demo](https://github.com/thomaspink/ng-storyblok-demo) App to see everything come together. The AppModule with the configuration can be found [here](https://github.com/thomaspink/ng-storyblok-demo/blob/master/src/app/app.module.ts).


## Next up
[Loading data using the Store](store.md)
