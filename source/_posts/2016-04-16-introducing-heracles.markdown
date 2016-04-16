---
layout: post
published: true
title: Introducing heracles - Hydra Core hypermedia client
date: 2016-04-16 15:20
categories:
- dajsiepoznac
- hydra
- heracles
description: The first post showing the heracles hypermedia library for working with Hydra Core API
comments: true
---

Lately I've been working on a library to consume [Hydra Core][hydra] hypermedia-rich APIs. This is something I've been
planning for a long time now and given that the [Argolis][Argolis] server-side component pretty much works it was about
time I started working on consuming the API Documentation.

In this post I showcase the simplest usage of heracles and describe some design decisions.

<!--more-->

The source code of heracles is *naturally* on [GitHub][heracles-gh]. It is written in TypeScript and bundled as an AMD
format package.

[![Heracles defeating the Hydra](/uploads/2016/04/427px-Antonio_Pollaiuolo_002.jpg)](https://commons.wikimedia.org/wiki/File:Antonio_Pollaiuolo_002.jpg)

## Getting started

### Installation

To start using heracles first download it using JSPM package manager.

``` bash
jspm install wikibus/heracles
```

### Basic usage

Now you are ready to start using the library. It is as simple as importing and executing the static `load` function. It
returns a promise of a resource.

{% codeblock lang:javascript %}
import * as Hydra from 'wikibus/heracles';

Hydra.Resource.load('http://my.api/my/resource')
    .then(res => {
        // do something with the resource
    });
{% endcodeblock %}

The returned model will always be expanded although in the future I could consider adding an optional `@context` parameter.

Every time a resource is loaded the `Link`ed Hydra API Documentation will be fetched as well to discover possible operations
for the resource(s). Here's an example of a documentation.

{% codeblock lang:json %}
{
    "@context": [
        "http://www.w3.org/ns/hydra/context.jsonld",
        {
            "vocab": "http://my.api/vocab#",
            "foaf": http://xmlns.com/foaf/0.1/"
         }
    ],
    "supportedClass": [
        {
            "@id": "vocab:Person",
            "supportedOperation": [
                {
                    "method": "GET",
                    "expects": "owl:Nothing",
                    "returns": "vocab:Person"
                }
            ],
            "supportedProperty": [
                {
                    "readable": true,
                    "writable": false,
                    "required": false,
                    "property": {
                        "@id": "vocab:pets"
                    },
                    "supportedOperation": [
                        {
                            "method": "POST",
                            "expects": "vocab:Pet",
                            "returns": "owl:Nothing"
                        }
                    ]
                }
            ]
        },
        {
            "@id": "vocab:Pet",
            "supportedProperty": [
                {
                    "readable": true,
                    "writable": true,
                    "required": true,
                    "property": "foaf:name"
               }
           ]
        }
    ]
}
{% endcodeblock %}

The above states a number of facts about the API:

> The server is known to return resources of the type `vocab:Person`.

> A `GET` request is known to be supported for resources of types `vocab:Person`

> The `vocab:Person` class can be expected to include a `vocab:pets` link to another resource

> That other, linked resource can be requested using `POST` with an instance of class `vocab:Pet`

> A valid instance of `vocab:Pet` must include the `foaf:name` property

All this information can be accessed from resources loaded using the `Hydra.Resource.load` method above. Given a representation
of the resource `http://my.api/Tomasz`

{% codeblock lang:json %}
{
    "@context": {
        "vocab": "http://my.api/vocab#",
        "foaf": "http://xmlns.com/foaf/0.1/"
    },
    "@id": "http://my.api/Tomasz",
    "@type": "vocab:Person",
    "vocab:pets": { "@id": http://my.api/Tomasz/pets" }
}
{% endcodeblock %}

It is possible to discover operations available for any of the instances

{% codeblock lang:javascript %}
// assume loaded earlier with Hydra.Resource.load('http://my.api/Tomasz')
var resource;

resource.getOperations().then(ops => {
    // will return the GET operation supported by the vocab:Person class
});

resource['http://my.api/vocab#pets'].getOperations().then(ops => {
    // will return the POST operation supported by the link type
    expect(ops[0].method)
});
{% endcodeblock %}

## Important bits and pieces

There are some decisions I made, which may influence how the server and client must act. Most notably

### Resources are expanded

First of all, as I've stated above, the loaded resource representation is expanded by default. This is because otherwise
it would be quite difficult to process them. This is true for example for inspecting the resource `@type`.

### `load` returns object with matching `@id`

If a resource representation is a larger graph of objects, the `load` function will always look for that identifier and
return that object even if it was not the root of the JSON-LD document. For example, the current design of collections in
Hydra is that each collection can be partitioned into views (for example for the purpose of paging). Requesting a resource
`http://my.api/Tomasz/pets?page=2` could return something similar to:

{% codeblock lang:json %}
{
    "@context": "http://my.api/some/context",
    "@id": "http://my.api/Tomasz/pets",
    "@type": "hydra:Collection",
    "hydra:member": [ ]
    "hydra:view": {
        "@id": "http://my.api/Tomasz/pets?page=2",
        "@type": "hydra:PartialCollectionView",
        "hydra:previous": "http://my.api/Tomasz/pets",
        "hydra:next": "http://my.api/Tomasz/pets?page=3"
    }
}
{% endcodeblock %}

As you see the requested resource is not the root of the representation tree. Still the `load` promise will resolve with
that object and not `http://my.api/Tomasz/pets`. This may be counterintuitive in the case of simple JSON-LD documents but
considering that the server could be returning [expanded][expand] or [flattened][flatten] documents it seems the only logical
way. Not to mention that other RDF media type could be requested by the client in which case, there would no obvious root
object.

Each common case from Hydra Core vocabulary like the `PartialCollectionView` (possible any object of the `hydra:view`
property) will be enriched with a link to the parent collection. Otherwise it wouldn't be possible to access it from the
returned object.

### Hydra documentation objects as compacted

For convenience elements of the Hydra Core vocabulary are compacted with the default hydra `@context` so that on can write
`op.method` instead of `op['https://www.w3.org/ns/hydra/core#method']`. If the object contained any non-standard content,
such as `SHACL` constraints for a supported property, it is possible to recompact with a custom context:

{% codeblock lang:javascript %}
operation.compact(myContext).then(compacted => {
    // access the properties as you see fit
});
{% endcodeblock %}

## Going further

A rich interaction with the loaded resource isn't possible just yet. As you see above currently only the basic metadata
about operations is available. I've also started work on accessing supported properties. In the future I plan a number
of facilities to ease invoking operations, handling common Hydra objects in specific ways, easier extensions, etc

[hydra]: http://hydra-cg.com/spec/latest/core/
[Argolis]: https://github.com/wikibus/argolis
[heracles-gh]: https://github.com/wikibus/heracles
[flatten]: https://www.w3.org/TR/json-ld-api/#flattening
[expand]: https://www.w3.org/TR/json-ld-api/#expansion