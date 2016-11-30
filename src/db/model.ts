/**
 * @license
 * Copyright (c) 2016 Thomas Pink
 *
 * Use of this source code is governed by the MIT-style license that can be
 * found in the LICENSE file at https://github.com/thomaspink/ng-storyblok/blob/master/LICENSE
 */

export class SBStory {
  id: number;
  name: string;
  slug: string;
  fullSlug: string;
  created: Date;
  published: Date;
  alternates: any[];
  sortByDate: any;
  tagList: any[];
  content: SBComponent;
  editable?: string;

  constructor({
    id,
    name,
    slug,
    fullSlug,
    created,
    published,
    alternates,
    sortByDate,
    tagList,
    content,
    editable
  }: {
      id: number;
      name: string;
      slug: string;
      fullSlug: string;
      created: Date;
      published: Date;
      alternates: any[];
      sortByDate: any;
      tagList: any[];
      content: SBComponent;
      editable?: string;
    }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.fullSlug = fullSlug;
    this.created = created;
    this.published = published;
    this.alternates = alternates;
    this.sortByDate = sortByDate;
    this.tagList = tagList;
    this.content = content;
    this.editable = editable;
  }

  toString() {
    `
      "id":"${this.id}",
      "name":"${this.name}",
      "slug":"${this.slug}",
      "fullSlug":"${this.fullSlug}",
      "created":"${this.created.toUTCString()}",
      "published":"${this.published.toUTCString()}",
      "alternates":"${this.alternates}",
      "sortByDate":"${this.sortByDate}",
      "tagList":"${this.tagList}",
      "_editable":"${this.editable}",
      "content": ${this.content.toString()}
    `;
  }
}

export class SBComponent {
  _uid: string;
  type: string;
  model: any;

  constructor({
    _uid,
    type,
    model
  }: {
      _uid: string;
      type: string;
      model: { [key: string]: any }
    }) {
    this._uid = _uid;
    this.type = type;
    this.model = model;
  }

  toString() {
    let str = `{_uid: ${this._uid},\ncomponent: ${this.type},`;
    let sep = '';
    for (var key in this.model) {
      if (this.model.hasOwnProperty(key)) {
        const value = this.model[key];
        str += `${sep}${key}:${JSON.stringify(value)}`;
        sep = ',\n';
      }
    }
    return str + ']';
  }
}
