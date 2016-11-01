import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SBSerializer } from './serializer';

@Injectable()
export abstract class SBAdapter {
  abstract loadStoryBySlug(): void;
  abstract loadStoryById(): void;

  abstract getStoryBySlug(): void;
  abstract getStoryById(): void;
}

@Injectable()
export class SBDefaultAdapter implements SBAdapter {
  constructor(private _serializer: SBSerializer, private _http: Http) { }

  loadStoryBySlug(): void {
    // this._http.get('https://api.storyblok.com/v1/cdn/stories/41107?&token=TI4mZJKY6rPnyrOQS6u3bAtt').lift()
  }

  loadStoryById(): void {
  }


  getStoryBySlug(): void {
  }

  getStoryById(): void {
  }

}
