---
layout: post
published: true
title: Maintaining documentation of JS library in lockstep with code
date: 2018-05-06 18:20
categories:
- javascript
- alcaeus
description: This article shows how to write documentation which will always follow the evolution of you code
keywords: javascript, documentation
comments: true
---

I've long been aware of GitBook.com as a way to easily author documentation pages. What I did not know before
was that it also comes with a robust tooling for building the book locally and building as a static website.
Works great with GitHub Pages, albeit needing some specific setup to run from the `/docs` folder. In itself
though it may just be a good-looking alternative to other static page generators or documentation builders.
The difference however is the abundance of plugins, and one plugin in particular useful for documenting JS
code. 

<!--more-->

## Setting up GitBook for GitHub pages

The GitBook toolchain has some setting which collide with how GitHub Pages expect you to organize your
repository. It's nothing really problematic but impossible to change so you may as well be aware of how
to work with both together.

The first step is to prepare your repository to host both code and documentation. See [this gitbook][docs]
to set up and install the command line tool. 

Next, initialize a folder for the markdown sources of your documentation pages. I called that folder `gitbook`.
You can do it by running the command below.

```bash
gitbook init ./gitbook
```

You will also have to create a `book.json` configuration file pointing to the root of you book

```json
{
  "root": "./gitbook"
}
```

To test your GitBook locally you can run `gitbook serve`. Note that you will want to ignore a folder called
`_book` which is where the site is being generated for serving locally.

Once you've created some pages you build static documentation pages by running `gitbook build`. In the latest
version of GitBook CLI there is no setting to control the output folder and it will by default write the
output to the same `_book` folder. GitHub pages however expects the static pages to be served from a `/docs`
folder, which also cannot be changed. The only way to make both happy is to pass an output folder to the
build command. I added a complete command to my `package.json`.

```json
{
  "scripts": {
    "build": "webpack; gitbook build . docs"
  }
}
```

This will take the sources from the root, as set up in `book.json` and write HTML to `/docs`. That should be,
just commit and push to publish your book on github.io.

[docs]: https://toolchain.gitbook.com

## Writing live snippets...

As mentioned before, GitBook itself is nice but the real great feature are numerous plugins, and one plugin
in particular: [RunKit](https://www.npmjs.com/package/gitbook-plugin-runkit). 
As [its page][runkit] states

> RunKit is Node prototyping

It lets anyone create actual live snippets running node with any package available on npmjs.org registry.
It is actually possible to load any particular version, similarly to how you would install a specific version
with Yarn on NPM. Additionally it also wraps the snippets in an async function so that they can use the 
`await` keyword instead of promises and renders a nice output for JS objects or HTML. Go ahead and see what
happens when you paste the snippet below snippet on [runkit.com][runkit].

{% codeblock lang:js %}
const fetch = require('isomorphic-fetch@2.2.0');

const xhr = await fetch('http://google.com');
await xhr.text();
{% endcodeblock %}

[runkit]: https://runkit.com/

### ...inside you GitBook...

Finally, the GitBook plugin makes it trivial to embed actual snippets within your documentation. To install
it add the plugin in you `book.json`

```json
{
  "plugins": [
    "runkit"
  ]
}
```

And run `gitbook install`.

Now you can add a runkit embed using a special `runkit` block:

{% codeblock %}
{% raw %}
{% runkit %} 
const fetch = require('isomorphic-fetch@2.2.0');

const xhr = await fetch('http://google.com');
await xhr.text();
{% endrunkit %}
{% endraw %}
{% endcodeblock %}

### ...and keeping them up to date with code

The ability to request any chosen version from NPM has one great implication. You can have the embedded
snippets always use a version matching the state of the repository. Instead of keeping a concrete number
in the runkit snippets, GitBook lets the authors create variables and inject them in their pages. Here's
my config file:

```json
{
  "variables": {
    "version": "0.4.0-a5"
  }
}
```

It defines a variable which I use in all my snippets so that they use the most recent version of my
library:

{% codeblock %}
{% raw %}
{% runkit %} 
const fetch = require('alcaeus@{{ book.version }}');

// more snippet
{% endrunkit %}
{% endraw %}
{% endcodeblock %}

At this point there are simple steps to follow in order to always have the documentation using the right
version:

1. Change my code as usual
1. Publish next version to NPM
1. Update documentation
1. Bump the GitBook `version` variable
1. Build GitBook 
1. Commit, tag and push repository

This way the online documentation always point to the most recent version but anyone checking out any tag
will be able to run the documentation as it existed at that point in time. And the code examples will use
the matching version from NPM!

### Bonus: documentating multiple versions of the library 

With a simple modification of these steps one could also keep multiple versions of the documentation,
targeting multiple versions of the library.

1. Build the book to a `/docs/latest` instead
1. Whenever you're ready to tag you repository, make a copy of that folder to one named after the
version. For example `/docs/v0.9`, `/docs/1.0`, `/docs/2.0`, etc.

This way you will keep all past versions documented alongside the latest on 
`github.io/my-lib/v0.9`, `github.io/my-lib/v1.0` and `github.io/my-lib/v2.0` respectively.

## See it in action

Go ahead and check Alcaeus' documentation pages at [https://alcaeus.hydra.how](https://alcaeus.hydra.how)
to see live examples published using the RunKit plugin.
