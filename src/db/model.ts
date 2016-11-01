export abstract class SBStory {
  id: number;
  name: string;
  slug: string;
  fullSlug: string;
  created: Date;
  published: Date;
  alternates: any[];
  sortByDate: any;
  tagList: any[];
}