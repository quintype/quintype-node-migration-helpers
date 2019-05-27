import { Writable } from 'stream';

interface StoryMandatoryFields {
  /** The id of this content in the external system */
  readonly 'external-id': string;

  /** The story headline */
  readonly headline: string;

  /** The canonical path to this story */
  readonly slug: string;

  /** The time of first publish. This should be in epoch date * 1000 for milliseconds */
  readonly 'first-published-at': number;

  /** The time of most recent edit. This should be in epoch date * 1000 for milliseconds */
  readonly 'last-published-at': number;

  /** The time of most recent edit. This should be in epoch date * 1000 for milliseconds */
  readonly 'published-at': number;

  /** The type of the story. Use `'text'` for a normal story */
  readonly 'story-template': string;
}

interface StoryHeroImageFields {
  /** A URL to pull the hero image from. This can be absolute, or relative starting with '/' */
  readonly 'temporary-hero-image-url'?: string;
  readonly 'hero-image-caption'?: string;
}

interface Metadata {
  /** All story attributes that belong to the story. Each key is a string and value is an array of strings */
  readonly 'story-attributes'?: {
    readonly [key: string]: ReadonlyArray<string>;
  };
}

interface StoryMetadataFields {
  /** The list of authors (in order) for this content */
  readonly authors: ReadonlyArray<{
    /** The id of the section or category in the source system */
    readonly 'external-id': string;
    readonly name: string;
  }>;

  /** List of tags. The name of the tag is case insensivite */
  readonly tags: ReadonlyArray<{ readonly name: string }>;

  /** List of sections or categories that this story belongs to */
  readonly sections: ReadonlyArray<{
    /** The id of the section or category in the source system */
    readonly 'external-id': string;
    readonly name: string;
  }>;

  /** 140 character social share message */
  readonly summary: string;

  /** Story Metadata */
  readonly metadata?: Metadata;
}

/** Use StoryBody to send a blob of HTML to be parsed later. Also {@link StoryElements} */
interface StoryBody {
  /** An HTML blob of the story. Should look like `"<p>Para1</p><p>Para2</p>""` */
  readonly body: string;
}

/** Use StoryElements for a more fine grained control on the created elements. Also see {@link StoryBody} */
interface StoryElements {
  readonly 'story-elements': ReadonlyArray<string>;
}

/** Represents a Story in the Editor. Please See Individual Parts of the Story. */
export type Story = StoryMandatoryFields & StoryHeroImageFields & StoryMetadataFields & (StoryElements | StoryBody);

export interface MetadataStreamOptions {
  readonly authorStream?: Writable;
  readonly sectionStream?: Writable;
  readonly storyAttributeStream?: Writable;
}

export interface ExternalId {
  readonly 'external-id': string;
}

export interface Author extends ExternalId{
  readonly name: string;
  readonly slug?: string;
  readonly email?: string;
  readonly username?: string;
  readonly 'avatar-url'?: string;
}

export interface Section extends ExternalId{
  readonly name: string;
  readonly 'display-name'?: string;
  readonly slug?: string;
  readonly children?: Section;
}

export interface StoryAttribute extends ExternalId {
  readonly name: string;
  readonly values?: ReadonlyArray<string>;
}
