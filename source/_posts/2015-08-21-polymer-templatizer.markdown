---
layout: post
published: false
title: Creating cool components with Polymer.Templatizer
date: 2015-08-21 10:00
categories:
- html
- js
description: How to reuse templates from Light DOM inside Polymer elements
comments: true
---

I've been looking for a way to create a collection component, in which I would declare the collection 
item template in the [Light DOM][dom] and then render that template bound to each item. I'm using
Polymer, because it is fun and insanely productive tool for creating Web Components. When I was already
close to actually writing my component in pure Web Component API I discovered the [Templatizer bevahiour][templatizer].

<!--more-->

I am working with [JSON-LD][json-ld] and [Hydra][hydra]. Nicely compacted, a Hydra collection is a JSON object with
an array of `members`:

``` js
{
  "@context": [
    "http://www.w3.org/ns/hydra/context.jsonld"
    {
      "label": "http://www.w3.org/2000/01/rdf-schema#label"
    }
  ],
  "@id": "http://example.com/my/collection",
  "@type": "Collection",
  "member": [
    {
      "label": "Item one"
    },
    {
      "label": "Item two"
    }
  ]
}
```

A simple way to display such collection would be to create a `<template is="dom-repeat">` to iterate over the memebers.
However this isn't perfect and I wanted a better component, where the item's template is supplied in the Light DOM.
This way it can be reused for rendering various collections and also extended with `<content>` tags to support stuff 
like custom header/footer or paging controls (see [PagedCollection][paged-collection]). For the time being, I call it simply
`<hydra-collection>`. 

## 

``` html
<hydra-collection collection="{{myCollection}}">
  <div class="item">
  </div>
</hydra-collection>
```


My first naive attempt was to distribute an item template inside a repeater:

``` html


```

[dom]: http://webcomponents.org/polyfills/shadow-dom/
[templatizer]: https://github.com/Polymer/polymer/blob/master/src/lib/template/templatizer.html
[json-ld]: http://json-ld.org
[hydra]: https://www.w3.org/community/hydra/
[paged-collection]: http://www.hydra-cg.com/spec/latest/core/#collections
