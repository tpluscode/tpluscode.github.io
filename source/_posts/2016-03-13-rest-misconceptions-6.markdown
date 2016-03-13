---
layout: post
published: true
title: REST misconceptions part 6 - Versioning and Hypermedia
date: 2016-03-13 17:00
categories:
- rest
- hypermedia
description: There is a heated debate about how to maintain serve multiple versions of a REST API and most opinions are wrong
comments: true
---

This will be the last part about REST mistakes and confusion for the time being. In this post I will share my opinions
about common approaches to versioning REST APIs. I will also present my view about why and how versioning could be avoided.

<!--more-->

In this series:

1. [Introduction](/blog/2016/02/rest-misconceptions-0)
1. [Misuse of URIs](/blog/2016/02/rest-misconceptions-1)
1. [Not linked enough](/blog/2016/03/rest-misconceptions-2)
1. [Leaky business](/blog/2016/03/rest-misconceptions-3)
1. [Resources are application state](/blog/2016/03/rest-misconceptions-4)
1. [REST "documentation"](/blog/2016/03/rest-misconceptions-5)
1. **Versioning**

## How can I version my URI?

Troy Hunt wrote in his [blog posting][thunt], there are number of ways to version a REST API and all of them wrong. There
are the 3 common ways, but together with a bunch of comments under Troy's post, one could count up to 6 or maybe 8 various
wrong options. First let's look again at the most common and then I'll try to convince you that there is in fact a way 
less wrong.

### Version number in URI

Like most other problems with REST, a common flawed approach to API versioning stems from [misunderstanding of the URI](/blog/2016/02/rest-misconceptions-1).
This popular way simply adds a version number as a segment in the resource identifiers, such as in a template

```
http://book.store/v{version}/books/{isbn}
```

This pattern could produce identifiers `http://book.store/v1.0/books/978-0321125217` and `http://book.store/v2.0/books/978-0321125217`
as identifiers for [the blue DDD book by Eric Evans](http://www.amazon.com/gp/product/0321125215). Immediately a question
should come to mind

> Do these URLs identify two separate resources?

I think not. It's the representation or the behaviour that changes and not the actual resource. The two identifiers are 
used to access the same resource. This is the most common argument why this is wrong. On the up side, this is temptingly 
simple and will never break the cache constraint.

And of course there is one case when the version in URL makes sense. That is when the resource changes and it each 
individual revision must be accessible at the same time (see below). This however is not why entire APIs need versions. 
Most often it's the representations or behaviour that changes. In other words it is the **contract** that changes.

### Version in Accept header

Another option for serving multiple versions of an API is the use of Accept headers. The client would add the version 
number to the request. In addition to (or instead of) plain `application/json`, the server would allow custom media types
like `application/vnd.bookstore.v2+json` to serve version 2 of a representation.

It [has been noted](http://www.troyhunt.com/2014/02/your-api-versioning-is-wrong-which-is.html#comment-2322098802) that 
for this solution to be symmetrical, the server should not only serve resources with various mime types, but should also
accept requests with versioned. And there is even more edge cases when `DELETE` method is concerned, which doesn't take
neither `Accept` nor `Content-Type` headers. 

Also only part of the server contract could change. For example the server could return updated representation for version
2 but still expect the same request body as in version 1. Does it mean that both need a new version, even if only part of
the API changes? I intuitively say yes, but I'm not so sure. Definitely dodgy space. 

Another issue with `Accept` header approach is that it will lead to [media type proliferation][proliferation].

### Custom header

Last of the common *wrong ways* is leveraging custom HTTP headers for requests:
 
``` http
GET /book.store/book/Hamlet HTTP/1.1
X-Version: 2
```

and responses:

``` http
HTTP/1.1 200 OK
X-Version: 2
```

The worst that can happen when applying API versioning this way is broken cache, where HTTP middleware ignores custom
headers.

Also, both custom header and vendor media type have another caveat. What should the server return when the client doesn't
specify a version? Returning the latest will keep breaking clients while returning the oldest (supported) will likely
stall adoption of the improved API.

## What am I versioning?

Let's take a step back and think about what actually can be version about an API. There are three possible answers:

1. The resource itself (ie. the content)
1. The resource representations
1. The resource behaviour

**Note** that in examples below I will be using pseudo [JSON-LD](http://jsonl-ld.org)+[Hydra](http://hydra-cg.com).

### Maintaining versions of a resource

As stated above, the first possibility is the only circumstance where adding a version number to a resource does indeed
make sense. This could be used for a parallel-universe dbpedia, where individual revisions of a wikipedia resource are
served as they changed over time. The main resource could be like

``` javascript
{
  "@context": "dbpedia.alternati.ve/context.jsonld",
  "@id": "/resource/Berlin",
  "revisions": [
    "/resource/Berlin/rev1",
    "/resource/Berlin/rev2",
    "/resource/Berlin/rev3"
  ],
  // whatever current data
}
```

This means the each revision is a resource in it's own rights and can be interacted with via representations.

### Handling changes in resource representations

This is where resource custom media types sound like a viable options. A new version of the media type could be introduced
to let the clients interact with the new and old representations. For example in the initial version of an API there can
be some sort of person resource:

``` javascript
{
  "@context": "example.company/context.jsonld",
  "@id": "/employee/tom",
  "name": "Tomasz Pluskiewicz"
}
```

What if someone decided to change on `name` field into `firstName` and `lastName`. A breaking change at first glance,
but there is nothing wrong with including both the old and new property instead of replacing:

``` javascript
{
  "@context": "example.company/context.jsonld",
  "@id": "/employee/tom",
  "@type": "Person",
  "name": "Tomasz Pluskiewicz",
  "firstName": "Tomasz",
  "lastName": "Pluskiewicz"
}
```

What about doing a `PUT` operation on that resource you ask? The media type used should actually inform clients what are
the required inputs. So before the change there would be something similar to:
 
``` javascript
{
  "@id": "Person",
  "type": "Class",
  "property": [
    { 
      "@id": "name",
      "required": true,
      "writeable": true
    }
  ]
}
```

This tells clients that in order to modify a `Person` resource, the `name` property must be set. Now after the change
we would have a different situation:

``` javascript
{
  "@id": "Person",
  "type": "Class",
  "property": [
    { "@id": "name", "writeable": false, "obsolete": true },
    { "@id": "firstName", "required": true, "writeable": true },
    { "@id": "lastName", "required": true, "writeable": false }
  ]
}
```

This time round the description of the `Person` class states that `firstName` and `lastName` properties are required. The
`name` property is still there but marked as read-only and obsolete, which could mean that it will be removed in the future.

Thus **if the server provides enough hypermedia descriptions and clients take advantage of them, no API versioning is 
actually required**.

### Evolving the resource behaviour

Last case is modifying how the client interacts with the resources. [A comment linked above](http://www.troyhunt.com/2014/02/your-api-versioning-is-wrong-which-is.html#comment-2322098802)
talks about change in a blogging platform. In the first version the blog is simply posted and published immediately. 
Such interaction could easily be modelled as a `POST` to some blog resource.

{% codeblock lang:http %}
POST http://t-code.pl/blog HTTP/1.1

{
  "title": "REST misconceptions part 6 - Versioning and Hypermedia",
  "text": "..."
}
{% endcodeblock %}

Let's say the the server returns a link to the newly created blog post. (I assume that the current date at the time of
submitting is used in the URL).

{% codeblock lang:http %}
HTTP/1.1 201 Created
Location: http://t-code.pl/blog/2013/03/REST-misconceptions-part-6
{% endcodeblock %}

So what happens when the contract changes so that a post is not published immediately but saved as draft? The first `POST`
request could stay the same, so there is nothing to break the client just yet. However the response would be different:

{% codeblock lang:http %}
HTTP/1.1 201 Created
Location: http://t-code.pl/blog/draft/REST-misconceptions-part-6
{% endcodeblock %}

A different `Location` is returned. The client now gets the draft resource and learns that there is a link, which is used
to publish.

{% codeblock lang:http %}
HTTP/1.1 200 OK

{
  "@id": "http://t-code.pl/blog/draft/REST-misconceptions-part-6",
  "@type": "Draft",
  "published": {
    "@id": "/blog/published",
    "body": {
      "@id": "http://t-code.pl/blog/draft/REST-misconceptions-part-6"
    }
  }
}
{% endcodeblock %}

The exact details of how the client should request are debatable but irrelevant really. All that matters is that the 
media type must be expressive enough to describe the interaction. And the client must follow.

## Summary

I hope that my example can convince someone out there that there are ways to avoid using version numbers within an API
completely. Rich hypermedia used from day one should insulate the client from any breaking changes that the server may
introduce. 

> You don't version the API. You don't version the resource. You don't version your media type. **You version you hypermedia controls**.
> *As a consequence if you don't have hypermedia controls, you're in trouble.*

It seem as though *almost* any other argument for adding version numbers anywhere in a REST API is the consequence of 
**not following the Hypermedia As The Engine Of Application State** and thus introducing **out-of-bound information** on
the client's side of affairs.

## Links

Here are some more interesting reads:

* [Versioning RESTful Services](http://codebetter.com/howarddierking/2012/11/09/versioning-restful-services/)
* [Versioning and Types in REST/HTTP API Resources](http://thereisnorightway.blogspot.com/2011/02/versioning-and-types-in-resthttp-api.html)
* [REST Is Not About APIs, Part 1](http://nirmata.com/2013/10/rest-apis-part-1/)
* [REST is OVER!](http://blog.steveklabnik.com/posts/2012-02-23-rest-is-over)

[thunt]: http://www.troyhunt.com/2014/02/your-api-versioning-is-wrong-which-is.html
[proliferation]: https://www.mnot.net/blog/2012/04/17/profiles