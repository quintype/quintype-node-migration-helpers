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
}

/** Use StoryBody to send a blob of HTML to be parsed later. Also @see StoryElements */
interface StoryBody {
  /** An HTML blob of the story. Should look like `"<p>Para1</p><p>Para2</p>""` */
  readonly body: string;
}

/** Use StoryElements for a more fine grained control on the created elements. Also @see StoryBody */
interface StoryElements {
  readonly 'story-elements': ReadonlyArray<string>;
}

/** Represents a Story in the Editor. Please See Individual Parts of the Story. */
export type Story = StoryMandatoryFields & StoryHeroImageFields & StoryMetadataFields & (StoryElements | StoryBody);
