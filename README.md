<p align="center">
  <h1 align="center">ng-storyblok</h1>
  <p align="center">Full <a href="https://storyblok.com" target="_blank">Storyblok</a> integration for your Angular2 App!</p>
</p>
<br>
<a href="https://travis-ci.org/thomaspink/ng-storyblok">
  <img src="https://api.travis-ci.org/thomaspink/ng-storyblok.svg?branch=master" alt="travis build" height="20">
</a>
<a href="https://badge.fury.io/js/ng-storyblok">
  <img src="https://badge.fury.io/js/ng-storyblok.svg" alt="npm version" height="20">
</a>
<br><br>
## What is ng-storyblok
This is the home of ng-storyblok, that brings full Storyblok integration in you Angular 2 App. It includes a Directive for rendering storyblok components on the fly as well as injectable Services for loading, caching data and serializing data as well as a high level SDK.

## Status
ng-storyblok is still under development and should not be used in production until we pulish version 1.0. For detail information have a look at our [1.0 milestone](https://github.com/thomaspink/ng-storyblok/milestone/1)

## Installation & Setup

### Install the CLI
 
 ```bash
 npm install -g angular-cli
 ```
 
### Create a new project
 
 ```bash
 ng new my-project
 ```

The new command creates a project with a build system for your Angular app.

### Install ng-storyblok

```bash
npm install --save ng-storyblok
```

### Import the ng-storyblok NgModule
When importing the module you have to provide a configuration to the `forRoot` method. The config must at least contain the public access token you can find in your storyblok backend.
  
**src/app/app.module.ts**
```ts
import { SBModule } from 'ng-storyblok';
// other imports 

export function storyblockConfigFactory() {
  return {
    accessToken: '[[PUBLIC-SB-TOKEN]]'
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

## Getting started
See our [Getting Started](docs/getting-started.md) Guide in your docs for more information.

## Demo
Have a look at out [ng-storyblok-demo](https://github.com/thomaspink/ng-storyblok-demo) project to see a full Angular2 App with ng-storyblok integration.
