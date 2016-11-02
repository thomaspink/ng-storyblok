<p align="center">
  <h1 align="center">ng-storyblok</h1>
  <p align="center">Angular 2 Directives and Services for <a href="https://storyblok.com" target="_blank">Storyblok</a></p>
</p>

## Getting Started
# WIP
### Install the CLI
 
 ```bash
 npm install -g angular-cli
 ```
 
### Create a new project
 
 ```bash
 ng new my-project
 ```

The new command creates a project with a build system for your Angular app.

### Install Angular Material components 

```bash
npm install --save @angular/material
```

### Import the ng-storyblok NgModule
  
**src/app/app.module.ts**
```ts
import { SBModule } from 'ng-storyblok';
// other imports 
@NgModule({
  imports: [SBModule.forRoot()],
  ...
})
export class MyAppModule { }
```
