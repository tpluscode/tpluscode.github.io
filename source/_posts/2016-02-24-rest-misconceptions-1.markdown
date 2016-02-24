---
layout: post
published: true
title: REST misconceptions part 1 - The URI confusion
date: 2016-02-24 21:40
categories:
- rest
- hypermedia
description: In this post I discuss the misunderstanding and common abuse of identifiers in REST APIs
comments: true
---

This is the second post in a series about REST, where I intend to debunk some commonly repeated mistakes and bad advice
for practitioners of RESTful services. The central, and agreeably most important element of any API, is the resource. 
On the Web resources are identified and addressed by URLs. REST defines some clear rules about these identifiers, yet we
so commonly break them. Let's see how this happens and what are the consequences.

<!--more-->

In this series:

1. [Introduction](rest-misconceptions-0)
1. **Misuse of URIs**
1. Not linked enough
1. Leaky business
1. Resources are application state
1. REST "documentation"

## What are RESTful identifiers?

Are the URLs below RESTful?

* http://events.beer/event/oktoberfest-2016/join
* http://book.store/book/45
* http://api.guru/a575c95c-da01-412c-b05e-7ea0c09a5c6a
* http://space.travel/destination/nyc/delete?id=10

Okay it was a trick question, because there is no such thing. If you haven't, you should definitely watch [this talk][goto],
in which [Stefan Tilkov][tilkov] discusses various REST mistakes including the misguided notion of RESTful URIs. 
The misunderstanding of the **identifier** in Representational State Transfer is important and very often repeated. 
Here's what Roy Fielding writes about identifiers in [section **6.2.4** of his dissertation][fielding-on-ids] (emphasis 
mine).

> Semantics are a by-product of the act of assigning resource identifiers and populating
> those resources with representations. **At no time whatsoever do the server or client
> software need to know or understand the meaning of a URI** — they merely act as a conduit
> through which the creator of a resource (a human naming authority) can associate
> representations with the semantics identified by the URI.

In other words, the identifier is just a pointer used to access resource representations and has no meaning itself. It is
a string and all resource semantics are included in the representation. Neither clients nor servers should have to parse
and derive any meaning from the identifier. Nor should they have to construct identifiers from pieces.

## URI abuse

There are many ways the identifier is misunderstood by REST practitioners. In this post I will focus on the design of the
URI itself but I will be raising this subject in subsequent posts because it appears to me that it's the root cause of 
most of the confusion surrounding REST.

There are a multitude of [discussions][plural], [articles][tutorial] and [blog posts][uri-design], which promote the idea
that some it is possible to state the **one URI is better that another**. Outside of REST this may be true. This may also
be true if combined with some aspects of the HTTP protocol but otherwise it is false. 

> All URIs are made equal

Otherwise it is just like saying the one number is better than another judging by face value alone. Here are some of the
common arguments.

### Hacking URIs

I've seen this one a lot. *URI should be hackable, readable, meaningful, predictable* and whatnot. Sure there is no harm
in hackable URI as long as it is not actually being hacked. There are very good articles on this by [Mark Seeman][hack]
and [Ben Morris][hack1]. 

The problem arises when clients actually start hacking URIs to construct server requests. Libraries have even appeared to
help developers manually build identifiers. Here's an example of [Restangular][restangular], which its authors describe as
**AngularJS service to handle Rest API Restful Resources properly and easily**. 

``` javascript
// Chain methods together to easily build complex requests
$scope.user.one('messages', 123).one('from', 123).getList('unread');
// GET: /users/123/messages/123/from/123/unread
```

Sure, it may be easy, but it's definitely not a proper handling of a REST API. Such practice introduces coupling between
the client and a specific URL scheme. First and foremost it violates the self-descriptiveness of a REST resource, because
knowledge outside the representation is required. What is worse, such design is brittle, because the client will break
whenever the URL structure changes. 

Hackable and readable identifier has only superficial value to the developer and should have no value to the client.

### 'Plural or singular'

Some of my colleagues were surprised, but this [really is a thing][plural]. There are heated discussions on the web on
whether collections URI should be plural, but what about collection members. If there is a collections of book under
`/books` resource. I could add a book by executing the POST method on the collection resource.

```
POST /books
Host: http://book.store
```

In response I would return status code `201 Created` and a `Location` header. But what should be the header's value?

```
HTTP/1.1 201 Created
Location: ?
```

Should it be `/books/Hamlet` or `/book/Hamlet`? The answer is, it doesn't matter. **The client should follow links not
mint URLs**.

### Hierarchical URIs

There are proponents of URI schemes, where related resources are assigned a hierarchy of predictable set of identifiers. 
Actually the above example is a good start and such design is quite intuitive. This after all how directory tree of a 
filesystem works for example. One could expand the bookstore address space to include book chapters etc:

```
http://book.store/books
http://book.store/books/Hamlet
http://book.store/books/Hamlet/chapters
http://book.store/books/Hamlet/acts/
http://book.store/books/Hamlet/acts/1
http://book.store/books/Hamlet/acts/1/scenes
http://book.store/books/Hamlet/acts/1/scenes/1
```

It encourages hacking URIs, which I brought up as my first example of URI abuse. Is that good design? Maybe it's easier 
to assign such identifiers when they are created. But this structure should not matter further on. That is because 
**the client should follow links not mint URLs**.

### Nouns not verbs

There is a rumor, which states that an URL must not contain verbs. Of course identifier such as 
`http://book.store/books/Hamlet/reserve` may be an indication of bad design, which tries to imitate na RPC style API.
But that is only true if HTTP verbs are not used correctly. For example
 
{% highlight http %}
PUT /books/Hamlet/reserve

{
   "for": "/user/tpluskiewicz"
}
{% endhighlight %}
 
This is a bad idea, because `PUT` must be idempotent. The client should be safe to try again without risk. But replace it
with `POST` and you're fine. Also in most cases it's possible to change the verb to noun and be done with it. There's a
[nice post][verbs] on that subject. To make the identifier more *RESTful* the URI can be changed to 
`http://book.store/books/Hamlet/reservation` and used just the same way: 

{% highlight http %}
POST /books/Hamlet/reservation

{
   "for": "/user/tpluskiewicz"
}
{% endhighlight %}

But is the identifier more `RESTful`? No, again, because there is no such thing. **It's how the resource is used that 
determines good API design, not the URI**. 

### Content negotiation is not the URI

I don't even know how to name this. How many times have you seen na API, which requires the client to include the format
in the URI:

```
http://book.store/books/Hamlet.json
http://book.store/books/Hamlet.xml
```

Or worse yet

```
http://book.store/json/books/Hamlet
http://book.store/xml/books/Hamlet
```

Do these pair identify two separate resources? Of course not, they both identify the book *The Tragedy of Hamlet, Prince
of Denmark*. One could argue of course that they identify documents about the `/books/Hamlet` resource and that's true.
But these documents are two completely different resources. And trying to update the book by requesting

```
PUT /xml/books/Hamlet

<?xml version="1.0"?>
<book>
   <title>The Tragedy of Hamlet, Prince of Denmark</title>
</book>
```

Should change only the title for the XML document, if anything. To update the book itself the actual id `/books/Hamlet`
should be used. And to request a specific format there is content negotiation. The server may then redirect to the document
or add the `Content-Location` header but that is a different matter entirely. The [distinction between resource][cool-uris] 
and its document has been described by no one else but sir Tim Berners Lee himself.

### Query string parameters

Okay, I do understand so of the arguments for the RESTful URI, but I'm totally stumped about this one. Here's what I read

> Query args (everything after the ?) are used on querying/searching resources (exclusively)

Where did that come from? How is `/books?id=1234` worse than `/books/1234`? Please scroll back up and see again what Roy
Fielding wrote about URIs. It's the mapping from identifier to resource representation that matters and not whether the 
URI has query parameter instead of a segment. If the server assigned it that way, so be it.

Another point is whether a filtered collection resource is another resource? Foe example let's search the `/books` resource 
for other books by Shakespeare:

```
GET /books?author=Shakespeare
```

Does it mean that `/books?author=Shakespeare` is not a resource? It's probably a matter of semantics and personal taste,
but if someone chose to treat is as a separate *(derived)* resource then clearly the query string parameter is part of 
the identifier. Deal with it.

By the way, there a very interesting little book called [Resource Oriented Architecture Patterns][amazon], which I call
the [Gang of Four patterns][gof] for designing resources.

## Good URI design

A RESTful URI doesn't exist but this doesn't mean that there aren't good and bad ways to design identifiers. Let's just
accept the fact that it usually is not directly related to REST style anyway. And alone never makes an API better or 
worse in that regard.

## Proper use of URIs

What really matters is how a URI is used. I've already touched that subject when I mentioned the use of verbs. Also
content negotiation qualifies as misuse of URIs. But worst of all, particularly in terms of REST APIs, is that representations
are not linked. Without links no wonder clients have to hack and mint URIs all the time. This simple yet rarely employed
practice will be the topic of my next post.

[fielding-on-ids]: http://presentations.t-code.pl/hateoas/fielding_dissertation.pdf#page=132
[goto]: https://youtu.be/pspy1H6A3FM?t=17m4s
[tilkov]: http://twitter.com/stilkov
[plural]: http://stackoverflow.com/q/6845772/1103498
[tutorial]: http://www.restapitutorial.com/lessons/restfulresourcenaming.html
[uri-design]: http://blog.2partsmagic.com/restful-uri-design/
[hack]: http://blog.ploeh.dk/2013/05/01/rest-lesson-learned-avoid-hackable-urls/
[hack1]: http://www.ben-morris.com/hackable-uris-may-look-nice-but-they-dont-have-much-to-do-with-rest-and-hateoas/
[restangular]: https://github.com/mgonto/restangular
[verbs]: https://looselyconnected.wordpress.com/2011/02/01/a-proposal-for-rest-and-verbs/
[cool-uris]: https://www.w3.org/TR/cooluris/
[amazon]: http://www.amazon.com/Resource-Oriented-Architecture-Patterns-Synthesis-Lectures/dp/1608459500/
[gof]: http://c2.com/cgi/wiki?DesignPatternsBook