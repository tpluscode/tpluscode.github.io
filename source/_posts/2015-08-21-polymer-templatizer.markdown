---
layout: post
published: true
title: Creating cool components with Polymer.Templatizer
date: 2015-08-23 10:00
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

A simple way to display such collection would be to create a `<template is="dom-repeat">` to iterate over the members.
However this isn't perfect and I wanted a better component, where the item's template is supplied in the Light DOM.
This way it can be reused for rendering various collections and also extended with `<content>` tags to support stuff 
like custom header/footer or paging controls (see [PagedCollection][paged-collection]). For the time being, I call it 
simply `<hydra-collection>`. 

**TL;DR;** [here's the working solution](#templatizer)

## First attempt _(¡doesn't work!)_

My naive attempt was to distribute an item template inside a repeater.

``` html
<!-- The Light DOM declares an .item element, which is used as the template -->
<hydra-collection collection="{{ "{{ myCollection " }}}}">
  <div class="member">
    Label: <span>{{member.label}}</span>
  </div>
</hydra-collection>

<!-- Now in my element I place <content> in <dom-repeat> -->
<dom-module id="hydra-collection">
  <template>
    <template is="dom-repeat" items="{% raw %}{{collection.members}}{% endraw %}">
      <content select=".member" member="{{item}}"></content>
    </template>
  </template>
</dom-module>
```

Unfortunately this cannot work, because it is not how `<content>` tags are used. Basically, the first time
the repeating template iterates, all nodes matched by `<content>` are distributed and subsequent iterations 
render nothing. The other problem is with data binding, which is done in the parent scope. Obviously I need a 
template in the Light DOM.

## <template> in Light DOM _(¡almost works!)_

Inspired by a [google group post](https://groups.google.com/d/msg/polymer-dev/sEyfXJMAkQc/Ga5_8YGPksEJ) by 
Eric Bidelman I thought that I could define a template in the Light DOM and then clone and bind it inside my 
component. This will first solve the binding problem

``` html
<!-- Template in the Light DOM -->
<hydra-collection collection="{{myCollection}}">
  <template class="member">
    Label: <span>{{member.label}}</span>
  </template>
</hydra-collection>

<!-- <content> sits outside of the repeater -->
<dom-module id="hydra-collection">
  <template>
    <div id="repeater"></div>
    <content id="templates" select="template.member"></content>
  </template>
</dom-module>

<!-- distributed template is cloned in loop and added to the Local DOM -->
<script>
  
  Polymer({
    is: 'hydra-collection',
    parameters: {
        collection: Object
    },
    ready: function() {
      var template = Polymer.dom(this.$.templates).getDistributedNodes()[0];
     
      var items = this.collection.member;
      for(var i=0; i < items.length; i++) {
        var clone = document.importNode(template.content, true);
        clone.member = items[i];
        Polymer.dom(this.$.repeater).appendChild(clone);
      }
    }
  });
  
</script>
```

This time I tried instantiate the templates by using native [Web Components API][templates]. Unfortunately
the template cloned from a node distributed by Polymer contains only an empty `#document-fragment`. It may be a problem
with [Shady DOM][shady] so other Polymer quirk (it definitely works with pure-WC with Shadow DOM). Also the native
way doesn't help with data binding anyway.

Nevertheless Polymer's `dom-repeat` component does a similar thing and looking at the source code I discovered
Polymer.Templatizer.

## Polymer.Templatzier <a name="templatizer"></a>

Polymer.Templatizer is the Polymer way to create instances of templates and takes care of data binding too. It can be 
added to any Polymer element as a [behaviour][behaviors] and adds a number of methods, out of which the most
important are `templatize` and `stamp`, which prepare the template and create actual instance respectively.


``` html
<!-- Same as above, <template> is used in Light DOM -->
<hydra-collection collection="{{myCollection}}">
  <template class="member">
    Label: <span>{{member.label}}</span>
  </template>
</hydra-collection>

<!-- <content> sits outside of the repeater -->
<dom-module id="hydra-collection">
  <template>
    <div id="repeater"></div>
    <content id="templates" select="template.member"></content>
  </template>
</dom-module>

<!-- templates are instantiated with Templatizer instead -->
<script>
  
  // add Templatizer behavior
  Polymer({
    is: 'hydra-collection',
    behaviors: [
      Polymer.Templatizer
    ],
    parameters: {
        collection: Object
    },
    ready: function() {
      var template = Polymer.dom(this.$.templates).getDistributedNodes()[0];
      
      // templatize must be called once before stamp is called
      this.templatize(template);
     
      var items = this.collection.member;
      for(var i = 0; i < items.length; i++) {
      
        // clone the template and bind with the model
        var clone = this.stamp({});
        clone.member = items[i];
        
        // append clone.root to DOM instead
        Polymer.dom(this.$.repeater).appendChild(clone.root);
      }
    }
  });
  
</script>
```

This works like charm but I find two minor issues with this API. First, it is weird that `templatize` doesn't return
a value, but rather modifies some internal state used by `stamp`. I would prefer that to be more functional:

``` js
var template = this.templatize(templateNode);
var clone = this.stamp(template, { });
dom.appendChild(clone.root);
```

Second is a problem with the stamp method. The documentation says it accepts an object with the initial state to bind
to but that didn't work for me. It is merely a nuisance though, because any property set on the stamped clone and bound
just fine. So, that's why instead of 

``` js 
var clone = this.stamp(template, {
  member: items[i]
});
```

I had to write

``` js 
var clone = this.stamp(template, { });
clone.member = items[i];
```

I'm not sure why I had this problem though, because it sure as hell [works in plunker](http://plnkr.co/edit/MyPOz12b2MkTpfravUGy).

## Bottom line

I very much like the Templatizer :heart_eyes:. It makes it possible to create very rich and composable web components 
while still giving the developers full power of Polymer magic! :sparkles:

[dom]: http://webcomponents.org/polyfills/shadow-dom/
[templatizer]: https://github.com/Polymer/polymer/blob/master/src/lib/template/templatizer.html
[json-ld]: http://json-ld.org
[hydra]: https://www.w3.org/community/hydra/
[paged-collection]: http://www.hydra-cg.com/spec/latest/core/#collections
[templates]: http://www.html5rocks.com/en/tutorials/webcomponents/template/
[shady]: https://www.polymer-project.org/1.0/articles/shadydom.html
[behaviors]: https://www.polymer-project.org/1.0/docs/devguide/behaviors.html
