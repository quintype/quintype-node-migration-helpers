import { Writable } from 'stream';

/** Mandatory fields of story */
interface StoryMandatoryFields extends ExternalId {
  /** The story headline */
  readonly headline: string;

  /** The canonical path to this story */
  readonly slug: string;

  /**
   * List of sections or categories that this story belongs to
   * @minItems 1
   */
  readonly sections: ReadonlyArray<IntermediateSection>;

  /**
   * The list of authors (in order) for this content
   * @minItems 1
   */
  readonly authors: ReadonlyArray<IntermediateAuthor>;

  /** The type of the story. Use `'text'` for a normal story */
  readonly 'story-template': 'text' | 'photo' | 'video' | 'poll' | 'live-blog';

  /** The time of first publish. This should be in epoch date * 1000 for milliseconds */
  readonly 'first-published-at': number;

  /** The time of most recent edit. This should be in epoch date * 1000 for milliseconds */
  readonly 'last-published-at': number;

  /** The time of most recent edit. This should be in epoch date * 1000 for milliseconds */
  readonly 'published-at': number;
}

interface StoryHeroImageFields {
  /** A URL to pull the hero image from. This can be absolute, or relative starting with '/' */
  readonly 'temporary-hero-image-url'?: string;
  readonly 'hero-image-caption'?: string;
}

interface Metadata {
  /** All story attributes that belong to the story. Each key is a string and value is an array of strings */
  readonly 'story-attributes'?: {
    readonly [key: string]: ReadonlyArray<string> | ReadonlyArray<Entity>;
  };
}

interface StoryMetadataFields {
  /** List of tags. The name of the tag is case insensivite */
  readonly tags?: ReadonlyArray<Tag>;

  /** 140 character social share message */
  readonly summary?: string;

  /** Story Metadata */
  readonly metadata?: Metadata;

  /** Story Seo */
  readonly seo?: { readonly [key: string]: string | ReadonlyArray<string> };

  /** Optional Subheadline */
  readonly subheadline?: string;

  /** status of story */
  readonly status?: 'open' | 'published';

  /** access of story */
  readonly access?: string;

  /** access-level-value of story */
  readonly 'access-level-value'?: number;
}

/** Use StoryBody to send a blob of HTML to be parsed later. Also {@link StoryElements} */
interface StoryBody {
  /** An HTML blob of the story. Should look like `"<p>Para1</p><p>Para2</p>""` */
  readonly body: string;
}

/** Use StoryElement to send individual story elements to the editor */
export interface StoryElement {
  readonly title?: '';
  readonly description?: '';
  readonly type: 'text' | 'image' | 'file' | 'jsembed' | 'youtube-video' | 'composite';
  readonly subtype:
    | 'null'
    | 'summary'
    | 'bigfact'
    | 'also-read'
    | 'quote'
    | 'blockquote'
    | 'blurb'
    | 'question'
    | 'answer'
    | 'q-and-a';
  readonly metadata?: object;
  // tslint:disable-next-line: no-mixed-interface
  readonly [key: string]: string | object | undefined;
}

export interface TitleStoryElement {
  /**
   * Content of Title
   * @minLength 1
   */
  readonly text: string;
  readonly type: 'title';
  readonly subtype?: null;
  readonly metadata?: object;
}

export interface TextStoryElement {
  /**
   * Content of Text
   * @minLength 1
   */
  readonly text: string;
  readonly type: 'text';
  readonly subtype: null;
  readonly metadata?: object;
}

/** Use StoryElements for a more fine grained control on the created elements. Also see {@link StoryBody} */
interface StoryElements {
  /**
   * The list ofstory-elements
   * @minItems 1
   */
  readonly 'story-elements': ReadonlyArray<TitleStoryElement | TextStoryElement>;
}

/** List of cards */
interface Cards {
  readonly cards: ReadonlyArray<Card>;
}

/** Represents a Story in the Editor. Please See Individual Parts of the Story. */
export type Story = StoryMandatoryFields &
  StoryHeroImageFields &
  StoryMetadataFields &
  (StoryElements | StoryBody | Cards);

export interface MetadataStreamOptions {
  readonly authorStream?: Writable;
  readonly sectionStream?: Writable;
  readonly storyAttributeStream?: Writable;
}

export interface ExternalId {
  /** The id of this content in the external system */
  readonly 'external-id': string;
}

/** Author of story */
export interface Author extends ExternalId {
  /** Full Name of Author  */
  readonly name: string;

  /** Slug associated with author */
  readonly slug?: string;

  /** Email of Author */
  readonly email: string;

  /** Username of Author */
  readonly username: string;

  /** Bio of Author */
  readonly bio?: string;

  /** Role of author */
  readonly role?: string;

  /** Avatar-url of author */
  readonly 'avatar-url'?: string;

  /** Additional detail of author */
  readonly metadata?: { readonly [key: string]: string | object };
}

/** Intermediate Author of story */
export interface IntermediateAuthor extends ExternalId {
  /** Email of Author */
  readonly email: string;

  /** Name of Author */
  readonly name: string;

  /** Username of Author */
  readonly username?: string;
}

/** Section of story */
export interface Section extends ExternalId {
  /** Name of section */
  readonly name: string;

  /** Display name for section that will appear in front end */
  readonly 'display-name'?: string;

  /** Slug of section */
  readonly slug: string;

  /** If this section is child of a section */
  readonly parent?: Section;

  /** Section Seo */
  readonly 'seo-metadata'?: {
    readonly description?: string;
    readonly keywords?: ReadonlyArray<string>;
    readonly 'page-title'?: string;
    readonly title?: string;
  };

  /** Additional details of Section */
  readonly 'collection-metadata'?: object;
}

/** Intermediate Section of story */
export interface IntermediateSection extends ExternalId {
  /** Name of section */
  readonly name: string;

  /** Slug of section */
  readonly slug: string;

  /** If this section is child of a section */
  readonly parent?: IntermediateSection;
}

export interface StoryAttribute extends ExternalId {
  readonly name: string;
  readonly values: ReadonlyArray<string>;
  readonly 'display-name': string;
  readonly 'data-type': 'multi-valued-strings';
  readonly 'is-mandatory': boolean;
}

/** Tag associated with story */
export interface Tag {
  /**
   * Name of Tag
   * @minLength 2
   * @maxLength 100
   */
  readonly name: string;

  /** Type of entity */
  readonly type?: string;

  /** slug of tag */
  readonly slug?: string;

  /** external ID of the tag */
  readonly 'external-id'?: string;
}

/** Entity associated with story could be story attribute could be Entity as Tag */
export interface Entity extends ExternalId {
  /** Name of Entity */
  readonly name: string;

  /** Type of entity */
  readonly type: string;

  /** slug and Additional detail of entity */
  // tslint:disable-next-line
  readonly [key: string]: string | object;
}

/** Card */
export interface Card extends ExternalId {
  readonly 'story-elements': ReadonlyArray<StoryElements>;
  readonly metadata: { readonly [key: string]: string | object };
  readonly id: string;
}
