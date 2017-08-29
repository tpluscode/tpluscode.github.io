---
layout: post
published: true
title: Building UI like LEGO (with string template literals)
date: 2017-08-29 22:45
categories:
- webcomponents
- javascript
description: A better way to create composable user interface using new ES6 features
keywords: web components, javascript, polymer
comments: true
---

Some time ago I experimented and [wrote][driven-ui] about building composable UI using Polymer and `<template>` was my
main building block. I used it to declare building blocks for my pages which I would dynamically interchange depending on
the displayed content. Unfortunately I've hit a number of roadblocks but I think I've just recently found a solution. 

<!--more-->

Just last week I attended the [third Polymer Summit][summit] in Copenhagen where [Justin Fagnani][justin] showed his
newest experiment: [`lit-html`][lit-html]. You should definitely watch his presentation:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">What is the middle ground between full VDOM and manual DOM manipulation? Check out <a href="https://twitter.com/justinfagnani">@justinfagnani</a>’s lit-html <a href="https://t.co/a0aR7c70FV">https://t.co/a0aR7c70FV</a></p>&mdash; Surma (@DasSurma) <a href="https://twitter.com/DasSurma/status/902500278905303041">August 29, 2017</a></blockquote> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## The end of `<dom-module>`

Why is this important? Apparently, the next version of Polymer won't directly use the `<template>` tag. Instead, it will
be 100% JS. Yes, you heard correctly. No more `<dom-module>`:

{% codeblock lang:js %}
import { Element as PolymerElement } from '../@polymer/polymer/polymer-element.js';
export class MyElement extends PolymerElement {
    static get template() {
      return `
      <h1>Hello World!</h1>
    `;
  }
}
customElements.define('my-element', MyElement);
{% endcodeblock %}

As you see, instead of HTML+JS, there is only code. Looks more like React+JSX, doesn't it? It sparked heated discussions
at the conference, on Polymer's Slack channel and on Twitter. 

At this stage though, the above `template()` method returns a static HTML string, which is then injected into a HTML
template and later stamped into the element's shadow root. Justin's lit-html, akin to a number of earlier libraries takes
this one step further, thanks to the properties of JavaScript's [template literals][lit] (the backtick strings, duh!).

## Template literals

Here's an example how a basic component could use lit-html 

{% codeblock lang:js %}
export class CountLit extends HTMLElement {

  constructor() {
    super();

    this.counter = 0;
  }

  connectedCallback() {
    this.addEventListener('click', e => {
      this.counter++;
      this.render();
    });

    this.render();
  }

  render() {
    let times;
    
    if (this.counter === 1) {
      times = 'time';
    } else {
      times = 'times';
    }
  
    const template = html`You clicked me ${this.counter} ${times}`;

    render(template, this);
  }
}
{% endcodeblock %}

This is has all advantages of JS: scoping, syntax highlighting and suggestions and the ability to compose a template from
multiple other literals. This opens completely new possibilities where one can create decorator components or override
extensible points of parent element. Features which were very cumbersome with plain `<template>` tags.

But most importantly, lit-html is **FAST**. 

## lit-html is not Virtual DOM... but better

By design, the template literal can be prefixed with a tag (did you open the MDN link above?).
A tag, in this case called `html` is actually a function with a simple signature:

```js
html(strings, ...values);
```

The strings will be an array of all static parts and the values are the interpolated expressions. The trick is that
whenever the `render` function is called with the same template it will actually be just one instance (even if it's) not
visible in code. lit-html takes advantage of that fact and whenever the same template is used, it will only update any
changed expressions. 

In the example above each click will only update a tiny piece of the rendered HTML which will keep DOM operations to the
minimum. Even though the `times` variable is calculated each time, it will only ever be rendered when it actually changes
between renders. Not every time.

## So what about declarative UI? 

Previously I struggled to bend `<template>` to suit my needs in pursuit of a declarative solution for defining views
which are dynamically selected based on the content.

First of all, in my current implementation the order in which the templates appear in the page is important for the
order in which the will be selected. In case there are multiple matches.

Secondly, I used Polymer 1.0's [`Templatizer`][tempaltizer] which not only disappeared in Polymer 2.0, but it was also
notoriously buggy and hard to master.

With `lit-html` I will be "freed" from Polymer and likely implement my elements will in plain JS. Additionally it will
be much easier to work with those templates; to extend with ES classes and compose with less custom element on the page.

### Some sample code

At the top level would still be a view element

```html
<object-view id="top-view"></object-view>

<script>
    var objectView = document.getElementById('top-view');
    
    objectView.object = {
        "@type": "http://example.com/vocab#Person",
        "http://example.com/vocab#avatar": {
            "@type": "http://schema.org/ImageObject"
        }
    };
</script>
```

But from there on it could be all templates composed of smaller parts. Each part rendered with a template selected from
some `templateRepository`.

```js
import {TemplateRepository} from 'template-repository';
import {render} from 'template-selector';
import {html} from 'lit-html'; 

/**
* Will render http://example.com/vocab#Person
*/
class PersonTemplate extends TypeTemplate {
    
    get type() {
        return 'http://example.com/vocab#Person';
    }
    
    get context() {
        return { '@vocab': 'http://example.com/vocab#' };
    }
    
    get template(person) {
        return html`<h2>
                        ${person.name}
                    </h2>
                    <div class="details">
                        <a href="${person.website}">My website</a>
                    </div>
                    <div class="avatar">
                        ${render(person.avatar)}
                    </div>`;
    }
}

/**
* Will render http://schema.org/ImageObject 
*/
class SchemaImageTemplate extends TypeTemplate {

}

TemplateRepository.append(PersonTemplate);
TemplateRepository.append(SchemaImageTemplate);
```

The `render` imported above would select a template from the repository and insert it into the parent template. No need
for nesting `<object-view>` elements. That is of course if I figure out how to observe changes ;)

## Bottom line

I really do like what's coming with Polymer 3.0. It will embrace ES6 modules, finally. It may be that Polymer will become
more similar to Vue or React but it will still be closest to the Web Platform.

[driven-ui]: {% post_url 2016-04-30-hypermedia-driven-ui %}
[summit]: https://www.youtube.com/watch?v=yTASiOaXlck
[justin]: https://twitter.com/justinfagnani
[lit-html]: https://github.com/PolymerLabs/lit-html
[lit]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
[tempaltizer]: {% post_url 2015-08-21-polymer-templatizer %}
