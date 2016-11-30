export interface IndexableObject {
  [key: string]: any;
}

export interface SBComponentSchema extends IndexableObject {
  _uid: string;
  component: string;
}

export interface SBStorySchema extends IndexableObject {
  id: number;
  name: string;
  slug: string;
  fullSlug: string;
  created: Date;
  published: Date;
  alternates: any[];
  sortByDate: any;
  tagList: any[];
  content: SBComponentSchema;
  editable?: string;
}
