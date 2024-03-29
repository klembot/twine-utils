# twine-utils

📖 [API documentation](https://klembot.github.io/twine-utils/)

This lets you work with Twee source, Twine 2 stories, and story formats in a
programmatic way: combining them, adding extra JS or CSS, or otherwise modifying
them in JavaScript. This also is able to read Twine 1 stories (TWS) and the HTML
files created by Twine 1, but can't write them.

This library is intended to be used in a Node context, not a browser one, though
everything except the path module should work. They aren't efficient to use in a
browser context because they use Node modules for parsing HTML. In a browser
content, you can have the browser do this for you instead.

Things you can do with this library:

- Assemble a Twine story from disparate sources
- Convert a Twine story to another format, like JSON
- Incorporate Twine into a build process
- Build a tool that works with Twine stories