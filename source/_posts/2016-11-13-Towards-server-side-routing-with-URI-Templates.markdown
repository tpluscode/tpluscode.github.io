---
layout: post
published: true
title: Towards server-side routing with URI Templates (RFC 6570)
date: 2016-11-13 23:15
categories:
- nancy
- rest
- URI
description: I propose a way to use URI Templates for routing in Nancy and similar MVC frameworks
keywords: nancy, uri templates, rfc6570, rfc 6570, routing, rest
comments: true
---

There are many MVC frameworks out there and all of them share a common feature - routing. Most libraries use a form of
URI patterns to match incoming requests. On top of powerful features like limiting allowed values to certain types or
by using regular expressions, they all share a common flaw - great simplification of the [URI][uri].

There is however a similar [proposed standard][ps] described by [RFC 6570][rfc] and appropriately called **URI Template**
As the name implies, it defines URI patterns which can be then expanded to actual URIs by substituting variables and work
the opposite way by extracting variables from a given URI. This makes it a viable option for matching request URIs on the
server to determine what code to execute, if any. 

<!--more-->

## So what is wrong with typical routing?

In most libraries I have seen routing is declared simply by defining variables as URI segments:

* [Django][django] is all about regex:
  * `r'^blog/page(?P<num>[0-9]+)/$'`
* [Nancy][nancy], [ASP.NET Web API][webapi], [Service Stack][stack] or [Spring][spring] support a form of simplified URI Templates but extended with optional constraints:
  * `/content/{Version*}/literal/{Slug*}` - greedy segments (All)
  * `/ex/bars/{numericId:[\\d]+}` - number-only segment (Spring)
  * `users/{id:int}` number-only segment (Nancy, Web API)
* [Nancy][nancy] also does regular expressions:
  * `/(?<age>[\d]{1,2})`
* [Dancer][dancer] and [Express][express] use a similar syntax and also support regular expressions:
  * `/users/:userId/books/:bookId` (Both)
  * `/team/:team/**` (Dancer)
  * `/ab(cd)?e` (Express)
  
The features to constrain segments to specific values using regular expression or some custom feature certainly is a
powerful one but there is much more to URL than just segments (not to mention URI in general). The general syntax of an
URL is as follows:

```
scheme:[//[user:password@]host[:port]][/]path[?query][#fragment]
```

In a web application the scheme will usually be HTTP(S). Let's also ignore the user/password and host/port which aren't
usually the concern of a REST server accepting requests. That leaves us with the [path][url-path], [query][url-query] 
and [fragment][url-fragment]. 

> Do you notice already how typical routing completely neglects query and fragment?

In my opinion they should be part of it. Why, you ask? Read on! 

## Using identifiers like you probably should

### Query string is part of the identifier

In a RESTful API the identifier is the complete URL. If the client does a request like

``` http
GET /user?id=123 HTTP/1.1 
```

Why shouldn't it be possible to include the query string parameter as part of the route? It is after all an integral part
of the identifier. Yet all libraries that I've worked with require manual work to extract the value of `id` in user code. 

### Segments are so much more powerful

The URI path is a series of zero or more segments delimited by the slash `/` character. And so an absolute path like
`/users/tomasz/articles/uri-template` has four segments:

* users
* tomasz
* articles
* uri-template

But segments are not necessarily just text. And they certainly don't have to represent hierarchy of file system folders.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">A friendly <a href="https://twitter.com/hashtag/RESTful?src=hash">#RESTful</a> reminder - URL path does not represent file-system hierarchy. Heck, it doesn&#39;t have to be a hierarchy at all <a href="https://twitter.com/hashtag/hypermedia?src=hash">#hypermedia</a></p>&mdash; Tomasz Pluskiewicz (@tpluscode) <a href="https://twitter.com/tpluscode/status/797895110306369536">November 13, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

A little known feature, which I've only just discovered very recently, are parametrized path segments. They work similarly
to query strings:

```
/segment1;param1=val1;param2=val2,val3/segment2
```

See how `segment1` has extra bits attached. As JSON these parameters would be represented as
 
{% codeblock lang:json %}
{
  "param1": "val1",
  "param2": [
    "val2",
    "val3"
  ]
}
{% endcodeblock %}

And here's a practical example. A hypothetical API could serve a resource representing a collection of, say, books:
`http://example.rest/books`. Another resource could be used to retrieve covers of those books: `http://example.rest/books/gallery`.
Usually any manipulation of such resource is handed over ot query strings. 

So, what if the resource owner wanted to offer a gallery of books cover but only books by Oscar Wilde and only covers in
PNG format. Because why not?

The URL would probably look like `http://example.rest/books/gallery?author=Oscar%20Wilde&format=png`. Do you also see the
[SRP][srp] rule being validated? Why not instead use the URL like

```
http://example.rest/books;author=Oscar%20Wilde/gallery;format=png
```

And hey! Now it's possible to just drop the last segment and leave 

```
http://example.rest/books;author=Oscar%20Wilde
```

That looks like a resource containing books by Oscar Wilde. Despite the tweet quoted above, people do love URL hierarchies
right? They probably *are* quite useful in the end. 

And it's not just about [single responsibility][srp] of path segments (there probably isn't such a thing). I don't have
empirical proof, but I would guess that parametrizing segments could lead to better controller/module/handler design.

## So how do I implement that?

Most languages probably have a library out there that implements the URI Template standard. So just go ahead a try to
replace the routing in your favourite Web framework so that it works with RFC6570 instead. The books covers resource route
shown above would become:

```
/books{;author}/gallery{;format}
```

Isn't that nice? No query strings lurking in the implementation. Everything clear up front.

### My Nancy experiment

I did precisely that and created a proof of concept in [Nancy][nancy-git]. It's available on GitHub under 
[https://github.com/tpluscode/nancy.routing.uritemplates](https://github.com/tpluscode/nancy.routing.uritemplates) and
hopefully I will make it into a useful library (there are still some issues to sort out). 

In the current shape the usage is akin to implementing a typical Nancy application. Instead of `NancyModule` you implement
`UriTemplateModule` and replace the RouteResolver with `UriTemplateRouteResolver`. The actual route definition is just the
same:

{% codeblock lang:c# %}
public class TestModule : UriTemplateModule
{
    public TestModule() : base("/books")
    {
        Get("{;author}/gallery{;format}", GetCoverGallery);
    }
}
{$ endcodeblock %}

Such route will match `/books/gallery`, `/books;author=Shakespeare/gallery` and `/books/gallery;format=square`.

## Possible issues?

Have you made that far? Great. Now it's time to learn about the thorns that this rose has.

### Route variable constrains

In the beginning of this post I show how routing in existing libraries allow constraining captured variables using
custom syntax or regular expressions. The URI Templates specification has no such notion neither any extensibility mechanism.

This is not a great deal as ar as I'm concerned. It should be possible to replicate the constraining functionality of
Nancy or Spring by extending variable template expressions. The standard does reserve some characters for future use and
they could serve as a separator between the variable name and the constraining expression. For example, to only allow
the page variable of a collection to be an integer the template could be

```
/collection{/page|int}
```

The pipe character is reserved and as such cannot be a legal part of the expression. As a consequence, a web framework
could reliably separate the `page` variable from the `int` constrain.

### Route prioritization

This is something I haven't figured out yet. Nancy, and likely other libraries have the ability to work with multiple
routes matching a given URL. For example routes `/page/{title}/{sub}` and `/page/about/{sub}` would both match a
request for `/page/about/cats`. But because the `about` segment is an exact literal match in the latter route, that route
would actually be executed. It's potentially a deal-breaker and I'm eager to find a solution to that problem.

## Closing words

I'm looking forward to your comments here or at the [Nancy.Routing.UriTemplates](https://github.com/tpluscode/nancy.routing.uritemplates)
repository. 

I'm quite convinced that URI Templates should have been used for routing from get-go. To me it seems quite obvious now
that hypermedia is becoming more and more recognized as an important design pattern and URI Templates are an important
part of driving the clients between application states. 
Being able to reuse the same technology on both client and server side should be very beneficial to visibility and maintainability
of hypermedia-driven APIs.

[uri]: https://tools.ietf.org/html/rfc3986
[ps]: https://en.wikipedia.org/wiki/Internet_Standard#Proposed_Standard
[rfc]: https://tools.ietf.org/html/rfc6570
[django]: https://docs.djangoproject.com/en/1.10/topics/http/urls/
[dancer]: https://metacpan.org/pod/Dancer2::Manual#Route-Handlers
[express]: http://expressjs.com/en/guide/routing.html
[nancy]: https://github.com/NancyFx/Nancy/wiki/Defining-routes
[webapi]: https://www.asp.net/web-api/overview/web-api-routing-and-actions/routing-in-aspnet-web-api
[stack]: https://github.com/ServiceStack/ServiceStack/wiki/Routing
[spring]: http://www.baeldung.com/spring-requestmapping
[url-path]: https://tools.ietf.org/html/rfc3986#section-3.3
[url-fragment]: https://tools.ietf.org/html/rfc3986#section-3.5
[url-query]: https://tools.ietf.org/html/rfc3986#section-3.4
[srp]: https://en.wikipedia.org/wiki/Single_responsibility_principle
[nancy-git]: https://github.com/NancyFx/Nancy