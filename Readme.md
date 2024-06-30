# What is this

I started this project because none of the major editors on the market quite satisfy my needs, and I figured I can
probably whip something decent together myself. It was pretty straight forward for the most part, but the biggest
takeaway from this project is that the browser APIs for selection manipulation and cursor control turned out to be quite
complex, and I learnt a lot while figuring that out.

Here's a demo: [https://nicklassandell.github.io/plume-editor/](https://nicklassandell.github.io/plume-editor/)

Key features include:

- Ability to control formats (classes) independently of the block tag (nodename) 
    - Formats can have a fixed nodename, or they can have a default and a whitelist of available Nodes.
- Strict markup control
- Plugin based. Tiny core, all features are plugin based. Pick what you need.
- Zero dependencies.
    - Also no usage of execCommand.

### Known issues

Don't use this. Some things not working are:

- Caret position restoration after applying formats
- Cannot apply inline formats (e.g links/bold/color etc) across multiple lines (blocks)
- Can only paste plaintext
    - You should only be able to paste content that you can normally build with the editor (only valid formats). I did
      not build a sanitiser for that, so for now I strip all formatting.

It's also missing some commonly used features like Lists.
