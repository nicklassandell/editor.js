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

# Why I built this

After having worked with (or at least tested) most major rich-text editors, none of them _really_ scratch my itch. In
particular, there are a few things I wish was better:

#### Mix of concerns with Formats

I've always wanted the ability to control styles (i.e. classes) and block tags (i.e. node names) separately. I.e. you
select Heading 1, but you might want it to be a \<h3> under the hood. This is very rarely needed, but there are cases
where it is useful,
e.g. in hero sections where might you want a large heading, but the \<h1> is defined elsewhere on the page. This is
something none of the major editors currently allow you to do out of the box. I've been able to hack together solutions
with plugins, but due to API limitations, the solutions, while functional, are not as nice as they could be.

### DOM purity

I want the ability to explicitly define which Formats, colors, inline-styles etc. are allowed. Most rich-text editors
allow you to define allowed tags in some way, but it is not as strict as I would like it to be. For example, you are
often still able to paste disallowed content, or add it through the HTML editor. None of the major editors I've tested
are good enough at this.

### Editor size

Even the smallest editors are a lot larger than I'd like, and often, features I don't need are bundled with the core.
Plume has a tiny core, and all features are split up into individual plugins that you can install as you desire.
Granted, Plume is not feature complete, but it's not _that_ far away.

### Known issues

Don't use this. Some things not working are:

- Caret position restoration after applying formats
- Cannot apply inline formats (e.g links/bold/color etc) across multiple lines (multiple blocks)
- Can only paste plaintext
    - You should only be able to paste content that you can normally build with the editor (only valid formats). I did
      not build a sanitiser for that, so for now I strip all formatting.

It's also missing some commonly used features like Lists.
