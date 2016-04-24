---
layout: post
published: true
title: Third labour of hypermedia - extensible media types
date: 2016-04-24 16:00
categories:
- dajsiepoznac
- hypermedia
description: 
keywords: dajsiepoznac, hypermedia, argolis, hydra core vocabulary, heracles
comments: true
---

Most hypermedia media types like [HAL][HAL] or [SIREN][SIREN] are some sort of extension of JSON, which is understandable.
JSON is a natural choice because it already is the most common data interchange format for APIs. However JSON as syntax 
is by design simple and it doesn't support vital part - **links**. To plug that hole these media types are intrusive in
that they impose a very specific structure of documents. Instead of extending the meaning of representations they hijack
the syntax and structure.

Personally I'm biased towards [Hydra Core Vocabulary][hydra] because, unlike all other I have come across, it is based on
RDF. Why is it important?

<!--more-->

## Extending JSON creates rigid structures 

Consider this sample from HAL specification website (excerpt).

{% codeblock lang:json %}
{
    "_links": {
        "self": { "href": "/orders" },
        "curies": [{ "name": "ea", "href": "http://example.com/docs/rels/{rel}", "templated": true }],
        "next": { "href": "/orders?page=2" },
        "ea:find": {
            "href": "/orders{?id}",
            "templated": true
        },
        "ea:admin": [{
            "href": "/admins/2",
            "title": "Fred"
        }]
    },
    "currentlyProcessing": 14,
    "shippedToday": 20,
    "_embedded": {
        "ea:order": [{
            "_links": {
                "self": { "href": "/orders/123" }
            },
            "total": 30.00,
            "currency": "USD",
            "status": "shipped"
        }]
    }
}
{% endcodeblock %}

What is all that business with `_links` and `_embedded`? Also would you prefer to serve or consume XML for some reason?
Well, that will not be possible because most other media types above, except Hydra, HAL is JSON-based. Hence the need for
that convoluted document structure. 

JSON also suffers from another deficiency - key ambiguity. It would be very easy to bump into clashes if we were to enrich
such representations with custom extensions.

## RDF is not syntax

I wrote that Hydra Core is RDF-based. Unlike JSON RDF is a standard way to describe data structures and not syntax. It is
possible to write the very same piece of data in a multitude of ways yet still retaining the exact same meaning. First
there are [**n-triples**][nt]. Let's state that my name is *Tomasz* and my friend can be downloaded from `http://t-code.pl/tomasz/friends`.

``` text
<http://t-code.pl/tomasz> <http://xmlns.com/foaf/0.1/name> "Tomasz" .
<http://t-code.pl/tomasz> <http://t-code.pl/api#friends> <http://t-code.pl/tomasz/friends> .
```

As you see almost everything is an URI. This solves the ambiguity problem. This is however very verbose and redundant and
will waste a lot od bandwidth for large response. Fortunately there are other media types, which can represent the same
information in different form. There is the compacted flavour of n-triples called [**Turtle**][ttl] and it's similar twin
[**Notation3**][n3].

``` text
@base <http://t-code.pl/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix api: <http://t-code.pl/api#> .

<tomasz> foaf:name "Tomasz" ;
         api:friends <tomasz/friends> .
```

There is also the old school XML-based format called [**RDF/XML**][rdfxml].

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
   xmlns:foaf="http://xmlns.com/foaf/0.1/"
   xmlns:api="http://t-code.pl/api#"
>
  <rdf:Description rdf:about="http://t-code.pl/tomasz">
    <api:friends rdf:resource="http://t-code.pl/tomasz/friends"/>
    <foaf:name>Tomasz</foaf:name>
  </rdf:Description>
</rdf:RDF>
```

And finally there are multiple JSON-based formats, the most prominent example being [**JSON-LD**][ld] which does a great
job pretending it is not really RDF.

{% codeblock lang:json %}
{
    "@context": {
        "@base": "http://t-code.pl/",
        "name": "http://xmlns.com/foaf/0.1/name",
        "friends": {
            "@id": "http://t-code.pl/api#friends",
            "@type": "@id"
        }
    },
    "@id": "tomasz",
    "name": "Tomasz",
    "friends": "tomasz/friends"
}
{% endcodeblock %}

## Hydra extends meaning not syntax

What Hydra core does is essentially extend the data (**not the syntax**) with various hint for the clients so that they
can discover how to perform more requests. For example let's add a hypermedia control stating that the above resource
`<tomasz>` can be updated with a `PUT` request.

{% codeblock lang:json %}
{
    "@context": "http://same.as.above/but/remote",
    "@id": "tomasz",
    "name": "Tomasz",
    "friends": "tomasz/friends",
    "http://www.w3.org/ns/hydra/core#operation": {
        "http://www.w3.org/ns/hydra/core#method": "PUT",
        "http://www.w3.org/ns/hydra/core#expects": { 
            "@id": "http://t-code.pl/api#Person"
        }
    }
}
{% endcodeblock %}

You could still convert this between various RDF serailizations and retain the meaning!

For a Hydra-based API to be complete there must be a lot of information provided by the server. The above is the tip of
the iceberg. The body of the described `PUT` request must conform the definition of the `http://t-code.pl/api#Person` type.

> But where is this definition? And how detailed can this definition be? 
 
Hydra core is served as a runtime API documentation, linked with a specific Link header relation. This documentation can
contain a number of simple definitions such as required fields, expected data types etc. It can also be extended so that
clients aware of the extension can adapt better to the API. For example a server can annotate a field as being a password,
so that an appropriate control is presented on the website.

This is where the first really big hurdle stands. 

> Where are these aware clients? And where are the servers? 

## We need the tooling

I've started creating both a server and client tools to produce and consume Hydra-based hypermedia. The server side is 
implemented as a .NET Library for Nancy called [Argolis][Argolis]. The client side is a JavsScript library called 
[heracles][heracles]. I'm also experimenting with a way to produce a dynamic yet customizable UI with Web Components.

I will be showing usage examples and discussing ideas in future blog posts.

[HAL]: http://stateless.co/hal_specification.html
[coll]: http://amundsen.com/media-types/collection/
[SIREN]: https://github.com/kevinswiber/siren
[narwhl]: http://www.narwhl.com/
[hydra]: http://hydra-cg.com/spec/latest/core/
[nt]: https://www.w3.org/2001/sw/RDFCore/ntriples/
[n3]: https://www.w3.org/TeamSubmission/n3/
[ld]: http://json-ld.org
[ttl]: https://www.w3.org/TR/2014/REC-turtle-20140225/
[rdfxml]: https://www.w3.org/TR/2014/REC-rdf-syntax-grammar-20140225/
[heracles]: http://github/com/wikibus/heracles
[Argolis]: http://github/com/wikibus/Argolis