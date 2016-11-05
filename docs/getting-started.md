# Getting started

Before getting started, please make sure ng-storyblok is installed as described in the [Readme](https://github.com/thomaspink/ng-storyblok).

## The NgModule
ng-storyblok provides a NgModule called `SbModule` that has to be imported in your AppModule file.
`src/app/app.module.ts`
```ts
import { SbModule } from 'ng-storyblok';
```

Now you have to add the imported `SbModule` to the imports array in your AppModule and call the `forRoot` method with a configuration object.
```ts
@NgModule({
  imports: [
    SbModule.forRoot({
      // your config goes here
    })
  ],
  ...
})
export class MyAppModule { }
```
## Configuration
The configuration consists of the following properties:

| Key                         | Type      | Description                                                                |
|-----------------------------|-----------|----------------------------------------------------------------------------|
| accessToken *[required]*    | string    | public access token for making requests to the storyblok api. You can grab it in the storyblok backend. |
| space *[optional]*          | string    | The id of your storyblok space. Get it in the storyblok backend            |
| endPoint *[optional]*       | string    | The endpoint of the storyblok API. You normally don't have to change this. |
| type *[optional]*           | string    | Defines how storyblok wraps your app in edit mode. Possible values are "full" and "widget". Default is "full". |
