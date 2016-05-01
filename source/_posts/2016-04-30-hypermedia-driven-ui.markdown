---
layout: post
published: true
title: Consuming hypermedia - declarative UI
date: 2016-04-30 22:25
categories:
- dajsiepoznac
- hypermedia
- polymer
description: There is still a lot of work ahead of hypermedia. This posts lists what we need to succeed with hypermedia APIs
keywords: dajsiepoznac, hypermedia, user interface, web components, polymer
comments: true
---

I've been going on about hypermedia for a long time now. I've touched both client and server side in terms of processing
resource representations. There is however a big missing piece in how developers should build user interfaces. Personally
I have been hooked on the idea of [Web Components][wc] and I've had some success experimenting with using a declarative
way for defining User Interface building blocks. 

<!--more-->

## Declarative views for resource representations

Assuming the use of RDF ([Resource Description Framework][rdf]), the user interface can be defined by creating a template
for given RDF class or data type. A few examples can include: :one: a dedicated custom element for displaying a person,
:two: a lightbox element for images typed as `schema:ImageObject` or :three: custom datepicker for `xsd:date`.

My idea for such syntax is to extend the `<template>` tag so that whenever it is added to DOM, it somehow registers itself
for use in specific case. Because the template tag itself is quite dumb I would take advantage of [Polymer][Polymer] data
binding features and [`Polymer.templatizer`][templatizer] so that developers can define dynamic templates.

At the top level, I envision a generic `<object-view>` element. It would inspect the given resource and choose among the
available specialized or generic templates (see further down).

``` html
<object-view id="top-view"></object-view>

<script>
    var objectView = document.getElementById('top-view');
    
    objectView.object = {
        "@type": "http://example.com/vocab#Person",
        "@id": "http://example.com/tomasz",
        "http://example.com/vocab#name": { 
            "@value": "Tomasz Pluskiewicz" 
        },
        "http://example.com/vocab#website": { 
            "@value": "http://t-code.pl" 
        },
        "http://example.com/vocab#avatar": {
            "@type": "http://schema.org/ImageObject",
            "http://schema.org/caption": { 
                "@value": "Me in Kraków" 
            },
            "http://schema.org/contentUrl": { 
                "@value": "http://example.com/tomasz/avatar-large.jpg" 
            },
            "http://schema.org/thumbnail": {
                "http://schema.org/contentUrl": { 
                    "@value": "http://example.com/tomasz/avatar-small.jpg" 
                }
            }
        }
    };
</script>
```

By setting the `objectView.resource` property the element would then look for template dedicated to the `ex:Person` class
(example :one:):

``` html
<template is="resource-view-template" 
          type="http://example.com/vocab#Person" as="person"
          compact-with='{ "@vocab": "http://example.com/vocab#" }'>
    <h2>
        [[person.name]]
    </h2>
    <div class="details">
        <a href="[[person.website]]">My website</a>
    </div>
    <div class="avatar">
        <object-view object="[[person.avatar]]"></object-view>
    </div>
</template>
```

See the `<object-view>` used again for `person.avatar`? This way it would be possible to create composable user interface
with specialized building blocks. Here's how a template for `schema:ImageObject` can be rendered as a kind of a lightbox
(example :two:):

``` html
<template is="resource-view-template"
          type="http://schema.org/ImageObject" as="img"
          compact-with='{ "@vocab": "http://schema.org" }'>
    <a title="[[img.caption]]" href="[[img.contentUrl]]">
        <img src="[[img.thumbnail.contentUrl]]" alt="[[img.caption]]" />
    </a>
</template>
```

A simple proof of concept is available [on Plunker](http://plnkr.co/edit/pQ6NOd)

### Template selection API

Further extensions could introduce new ways for selecting a template based on the resource content, based on the predicate
(*for example to use different template for property `ex:husband` vs property `ex:wife`)* or to be able to create templates
not only for resources but also for literals (*for example to select templates based on language tag?*)

## Common elements for Hydra Core types

Building on top of the API above it would be possible to created predefined common elements for [Hydra Core][hc] resources
returned by [heracles][heracles]. The most obvious idea is to build a reusable template for a `hydra:Collection`:

``` html
<!-- first template for collection elements -->
<template is="resource-view-template"
          type="https://www.w3.org/ns/hydra/core#Collection" as="collection"
          compact-with="http://www.w3.org/ns/hydra/context.jsonld">
          
    <template is="dom-repeat" items="[[collection.member]]" as="member">
        <object-view object="[[member]]"></object-view>
    </template>
    
    <div class="pager">
        <object-view object="[[collection.view]]"></object-view>
    </div>
</template>

<!-- views can have specialized templates -->
<!-- the current spec defines the PartialCollectionView type -->
<template is="resource-view-template"
          type="https://www.w3.org/ns/hydra/core#PartialCollectionView" as="view">
    <a href="[[view.first]]">First</a>
    <a href="[[view.previous]]">Previous</a>
    <a href="[[view.next]]">Next</a>
    <a href="[[view.last]]">Last</a>
</template>
```

See how again the `<object-view>` is used to delegate the decision on what template to render.

Obviously real life Hydra templates will need to be much more sophisticated. Template for `hydra:PartialCollectionView`
would definitely want to hide unnecessary link. Template for `hydra:Collection` would likely display a different view for
collection member from the view displaying the same object outside a collection. This could be a feature of the `<object-view>`
element though.

## Distributing templates

Finally one wouldn't want to declare these templates every time in an application. I imagine that a package containing
reusable Hydra Core elements would be simply wired up by a single element:

``` html
<!-- drop this on a page, and the above templates would be --> 
<!-- available for <object-view> elements -->
<hydra-core-templates></hydra-core-templates>
```

Similar element could be offered by data publishers somewhat satisfying the REST's code-on-demand constraint.

It is unclear however how it would be possible to customize behaviour of those templates/elements. Overriding the selected
template could be an easy way out though...

[wc]: http://webcomponents.org/
[rdf]: https://www.w3.org/RDF/
[Polymer]: http://polymer-project.org
[templatizer]: http://t-code.pl/blog/2015/08/polymer-templatizer/
[heracles]: http://github.com/wikibus/heracles
[hc]: http://hydra-cg.com