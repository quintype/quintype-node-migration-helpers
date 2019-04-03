Helper Functions for Migrations to the Quintype platform

## The Goal

This library is to be used to help easily migrate publishers. This library exposes utility functions that will automatically create .txt.gz files with the content that you expose. Once this is created, these files can be uploaded to S3 and imported by the Quintype Team.

Most functions accept an async generator function to push content. There are also types exposed so that you can ensure you are exporting all mandatory fields, and avoiding typos on optional ones.

If you are looking for a good place to start, please see [writeStories](./globals.html#writestories)
