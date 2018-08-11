---
layout: post
published: true
title: Writing storybook inlined with markdown
date: 2018-06-11 12:15
categories:
- javascript
- storybook
description: Using markdown and web components to write documentation within the actual stories
keywords: storybook, js, javascript, lit-html, custom elements
comments: true
---

What good are stories if you're not actually telling them? Storybook is a fantastic and versatile tool
to create runnable showrooms of elements written in a number of javascript libraries. It presents live
examples of components but lack in plain old storytelling - the prose. There are addons but they are not 
presentable enough ([addon-notes][an]) or do not support all targets ([addon-info][ai]).

Here I present a different approach, using [lit-html][lit] and a markdown [custom element][ce]. It works
well with my web components but hopefully could be adapted to handle any supported framework.

[an]: https://github.com/storybooks/storybook/blob/master/addons/notes
[ai]: https://github.com/storybooks/storybook/blob/master/addons/info
[lit]: https://polymer.github.io/lit-html/
[ce]: https://developers.google.com/web/fundamentals/web-components/customelements

<!--more-->

## What are you talking about?

Even if the addon-notes could be easily styled ot addon-info worked with something else than only React, I
kind of think that putting the textual description of the addons panel make them seem irrelevant. An
afterthought. Instead, I'd rather it was a prominent part of each story. Sharing space with the live examples.
Only then the stories create a complete documentation pages and not just a set of naked elements you can
prod.

Here's the end effect presenting my web components: [https://wikibus.github.io/lit-any/][litany]

[litany]: https://wikibus.github.io/lit-any/

![lit-any storybook](/images/lit-any.png)

Isn't that the way most documentations out there look like?

## Writing stories inside markdown

Creating a story is not much different from your typical setup.

{% codeblock lang:js %}
import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html/lib/lit-extended';
import markdownNotes from './notes/lit-form/fallback-input';

storiesOf('my-component', module)
    .add('Nicely documented', () => {
        const story = html`<my-component></my-component>`;
        
        return markdownNotes(story);
    }
{% endcodeblock %}

All of the markdown sits in a separate file. It is also javascript so I suppose it could be written right
nex to the story itself.

{% codeblock lang:js %}
import md from '../markdown';

export default function (story) {
    return md`## My component
    
This is markdown.
    
## Running example

${story}

## How it works

More beautiful docs go here. And maybe more live examples too.

---html
<my-component>
    Instead of backticks hyphens are used to avoid slash escaping. 
</my-component>
---`;
}
{% endcodeblock %}

As you see, the actual story will be rendered within the formatted text

## Rendering markdown 

The interesting bit you may notice above is the `md` import which in fact is a [template string tag function][tag].
Here's my lit-html implementation which wraps all static portions with a markdown rendering custom element
and combines them with the stories. It also handles non-template values so that it's possible to inject
not only stories but also any other content dynamically into the documentation template.

[tag]: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates

{% codeblock lang:js %}
import { html } from 'lit-html/lib/lit-extended';
import { TemplateResult } from 'lit-html';
import '../../bower_components/zero-md/build/zero-md.html';

function createZeroMd(markdown) {
    const zeroMd = document.createElement('zero-md');
    zeroMd.innerHTML = `<template><xmp>${markdown.replace(/---/g, '```')}</xmp></template>`;

    return zeroMd;
}

export default function (strings, ...keys) {
    if (keys.length === 0) {
        return html`${strings[0]}`;
    }

    let result = '';
    let currentMarkdown = strings[0];
    keys.forEach((key, i) => {
        if (key.constructor === TemplateResult) {
            result = html`${result} ${createZeroMd(currentMarkdown)} <br> ${key} <br <hr> <br> `;
            currentMarkdown = '';
        } else {
            currentMarkdown = `${currentMarkdown} ${strings[i]} ${key}`;
        }

        if (i === keys.length - 1) {
            currentMarkdown = `${currentMarkdown} ${strings[i + 1]}`;
            result = html`${result} ${createZeroMd(currentMarkdown)}`;
        }
    });

    return result;
}
{% endcodeblock %}

Since I'm creating web components, it came natural to me to compose my documentation pages using lit-html
and a 3rd party custom element to render markdown. There are a number to [choose from][md-wc]. I chose
`<zero-md>` which works well and I simply have used it before. Any other should be good too as long as it
can be be fed with markdown directly from HTML (as opposed to external `.md` files).

To load it I use `polymer-webpack-loader`. I tried adding the element to `preview-head.html` but it 
somehow interferes with the polyfill. Bundling with webpack is good enough. Installing from bower could also
be a faux pas but hey, it works.

## Room for improvement

At the point of writing the latest release of `lit-html` cannot render inside `<template>` tag. This should
change soon but for now I build the `<zero-md>` elements by hand.

Now that I think about it, the markdown rendering element could be replaced with simple JS-based
transformation. The element however comes with styling capabilities and by default imports GitHub rendering
styles.

Another current limitation of lit-html is that `import { html } from 'lit-html` cannot be mixed with
`import { html } from 'lit-html/lib/lit-extended`. It's also about to change soon but something to keep in
mind.

A lit-html-based implementation probably would not work with React but it should be simple enough to compose
the content with jsx instead in a similar fashion. 

[md-wc]: https://www.webcomponents.org/search/markdown
