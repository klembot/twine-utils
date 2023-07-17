# twine-utils

This lets you work with Twee source, Twine 2 stories, and story formats in a
programmatic way: combining them, adding extra JS or CSS, or otherwise modifying
them in JavaScript.

This library is intended to be used in a Node context, not a browser one, though
everything except the path module should work. They aren't efficient to use in a
browser context because they use Node modules for parsing HTML. In a browser
content, you can have the browser do this for you instead.

This doesn't have functionality for working with Twine 1 stories.

Things you can do with this library:

- Assemble a Twine story from disparate sources
- Convert a Twine story to another format, like JSON
- Incorporate Twine into a build process
- Build a tool that works with Twine stories