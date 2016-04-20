---
layout: post
published: true
title: Heracles resources vs JSON-LD compaction - enumerable js properties
date: 2016-04-20 08:45
categories:
- dajsiepoznac
- hydra
- heracles
- typescript
description: Heracles resources should work without problems with jsonld.js processing algorithms
comments: true
---

In my [previous post](/blog/2016/04/introducing-heracles/) I presented the first incarnation of Heracles, the Hydra Core
client library. While trying to replace my makeshift client I'd implemented for an in-house training project at [PGS][pgs]
I quickly decided that I'm going to need a way to compact my resources. It wasn't that hard but there was one simple
hurdle to overcome.

<!--more-->

## **TL;DR; with Heracles you can do this:**

{% codeblock lang:js %}
Hydra.Resource.load('http://my.api/my/resource')
    .then(res => {
        return jsonld.promises.compact(res, context);
    })
    .then(compacted => {
        // do something with the compacted resource
    });
{% endcodeblock %}

## URI properties are a nuisance

Just as in heracles, in my proof of concept code I too mostly worked with expanded JSON-LD objects. This has the downside
that any time I needed to access the properties full property identifiers must be used. Also it is not possible with
[Polymer][Polymer] to use the indexer notation for declarative data binding:

``` html
<!-- Such markup is not valid data binding syntax in Polymer -->
<span>{% raw %}{{myObject['http://xmlns.com/foaf/0.1/name']}}{% endraw %}</span>

<!-- Databound object's properties must be accessed with the dot notation -->
<span>{% raw %}{{myObject.name}}{% endraw %}</span>
```

This is precisely what JSON-LD compaction algorithm is for. It translates URI keys in a compacted JSON object. This 
translation is defined in a `@context` object.

{% codeblock lang:js %}
// before
var original = {
    'http://xmlns.com/foaf/0.1/name': 'Tomasz Pluskiewicz'
}

// after
var compacted = {
    '@context': {
        'name': 'http://xmlns.com/foaf/0.1/'
    },
    'name': 'Tomasz Pluskiewicz'
}
{% endcodeblock %}

There are many tricks up compaction's sleeve, which can help turning ugly JSON-LD into a digestive form. Have a look at
[this presentation][ld-example] by [Markus Manthaler][lanthi] for some more examples.

## My code before

In my code I used compaction to get rid of long URI keys so that I can take advantage of Polymer's data binding without
verbose methods like [computed properties][computed] or wrapping the object in a view model class.

{% codeblock lang:js %}
getAuthors(model)
{
    var context = {
        "@vocab": "http://wykop.pgs-soft.com/vocab#WeeksLink/",
        "member": "http://www.w3.org/ns/hydra/core#member",
        "links": {
            "@id": "http://wykop.pgs-soft.com/vocab#WeeksLinksBySubmitter/links",
            "@container":"@set"
        },
        "submitter": "http://wykop.pgs-soft.com/vocab#WeeksLinksBySubmitter/submitter"
    };

    jsonld.promises.compact(model, context).then(model => {
        this.compactedModel = model;
    });
}
{% endcodeblock %}

This is simple, the jsonld.js library takes care of the heavy lifting and produces a compacted object which is data binding
friendly.

## Enter heracles

How is this relevant to the heracles library? In my previous post I showed the `Operation` type (and other parts of the
ApiDocumentation classes) can be compacted so that working with them is easier.

Resources however are a little different. They are always returned expanded and thus should be ready for being compacted.
I was surprised to see that `jsonld.promises.compact` throws a stack overflow error. The reason is that JSON-LD algorithms
are not designed to work with cyclical object graphs. It simply loops until the call stack runs out.

### The Resource class

In my code I have this `PartialCollectionView` class (excerpt):

{% codeblock lang:js %}
export class PartialCollectionView extends Resource {
    private _collection;

    constructor(actualResource, apiDoc:IApiDocumentation, incomingLinks) {
        super(actualResource, apiDoc, incomingLinks);
        
        this._collection = findCollection(incomingLinks);
    }

    get collection() {
        return this._collection;
    }
}
{% endcodeblock %}

See the `collection` getter? This is where I had a cycle (collection -> view -> collection ...). There was also another
cycle inside the `apiDocumentation` getter in the base `Resource` class. There are actually two thing going on here. The
first and obvious culprit is the *private field*. Of course this is just TypeScript sugar, because it will become just a
typical field in the compiled JavaScript. JavaScript has no such notion of private members.

## Solution

The first step was to get rid of the field. There is no perfect way to do that but a friend of mine sent me [this post][weakmap],
which presents the use of `WeakMap` as a possible solution. With that I changed my code so that it no longer contains
unwanted fields. *(actual code is actually a little different but you get the drift)*

{% codeblock lang:js %}
var _collection = new WeakMap();

export class PartialCollectionView extends Resource {

    constructor(actualResource, apiDoc:IApiDocumentation, incomingLinks) {
        super(actualResource, apiDoc, incomingLinks);
        
        _collection = _collection.set(this, findCollection(incomingLinks));
    }

    get collection() {
        return _collection.get(this);
    }
}
{% endcodeblock %}

Unfortunately the compaction algorithm still entered the vicious cycle and failed. Why is that? Because [enumerable 
properties][enumerable]. jsonld.js [iterates over the object][iter] using simple `for (var i in obj)` loop, which also
returns all getters by default. One way is to use the native `Object.defineProperty` method instead of ES6 `get x()` 
syntax but it breaks TypeScript code analysis and generally smells. There is a better way though.

### Solution part two

Luckily TypeScript has the decorators and there is a decorator, which does precisely what I wanted. Instead of writing

{% codeblock lang:js %}
var _collection = new WeakMap();

export class PartialCollectionView extends Resource {

    constructor(actualResource, apiDoc:IApiDocumentation, incomingLinks) {
        super(actualResource, apiDoc, incomingLinks);
        
        _collection = _collection.set(this, findCollection(incomingLinks));
        
        Object.defineProperty(this, 'collection', {
            get: () => _collection.get(this)
        });
    }
}
{% endcodeblock %}

I can simply install the [core-decorators package](https://www.npmjs.com/package/core-decorators) from jspm (npm) and 
decorate the property with `@nonenumerable`

``` bash
jpsm install npm:core-decorators
```

{% codeblock lang:js %}
import { nonenumerable } from 'core-decorators';

var _collection = new WeakMap();

export class PartialCollectionView extends Resource {

    constructor(actualResource, apiDoc:IApiDocumentation, incomingLinks) {
        super(actualResource, apiDoc, incomingLinks);
        
        _collection = _collection.set(this, findCollection(incomingLinks));
    }

    @nonenumerable
    get collection() {
        return _collection.get(this);
    }
}
{% endcodeblock %}

### One Caveat

Of course this will still fail if there are actual cycles in the object graph. I'm hoping though that it won't be the
case all too often. And for the rare occasion a library like [circular-json][circ] can be used as suggested in [this github
issue][jsonld-issue]. It will make sure that the

[pgs]: http://pgs-soft.com
[Polymer]: https://www.polymer-project.org/
[ld-example]: http://www.slideshare.net/lanthaler/building-next-generation-web-ap-is-with-jsonld-and-hydra/23
[lanthi]: https://twitter.com/markuslanthaler
[computed]: https://www.polymer-project.org/1.0/docs/devguide/properties.html#computed-properties
[weakmap]: http://davidvujic.blogspot.com/2015/03/what-wait-really-oh-no-a-post-about-es6-classes-and-privacy.html
[enumerable]: https://developer.mozilla.org/pl/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
[circ]: https://www.npmjs.com/package/circular-json
[jsonld-issue]: https://github.com/digitalbazaar/jsonld.js/issues/97
[iter]: https://github.com/digitalbazaar/jsonld.js/blob/master/js/jsonld.js#L6594