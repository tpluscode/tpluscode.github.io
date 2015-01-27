---
layout: post
status: publish
published: true
title: REST, RDF and Hypermedia
date: !binary |-
  MjAxNC0wNi0xNSAxOTozMzo1NyAtMDQwMA==
categories:
- Semantic Web
- rdf
- rest
- hydra
redirect_from:
- /2014/06/rest-rdf-and-hypermedia/
comments: true
description: My thoughts what is REST and how it comes together with RDF
keywords:
  - rdf
  - hypermedia
  - rest
  - hateoas
---
## REST
[Representational state transfer](http://en.wikipedia.org/wiki/REST) or REST defines a number of architectural constraints,
which when applied allow building software, which is fast, scalable and simply interacted with.

TL;DR; RESTful application works very much like the Internet. A client requests a known resource by its identifier and
follows links included in the representations to move to another state. No further information should be required by the
client to know except the initial identifier.

<!--more-->

### REST constraints

As summed up on wikipedia, to implementa RESTful application a number of constraints must be fulfilled:

1. __[Client-server](http://en.wikipedia.org/wiki/Client%E2%80%93server_model)__ - interface separates clients from servers
1. __[Stateless](http://en.wikipedia.org/wiki/Stateless_protocol)__ - server stores no client information between requests
1. __[Cacheable](http://en.wikipedia.org/wiki/Web_cache)__ - allow and declare responses as cacheable, to improve performance
1. __[Layered system](http://en.wikipedia.org/wiki/Layered_system)__ - transparently stack intermediate proxies on top of the server
1. __Uniform interface__
1. __[Code on demand](http://en.wikipedia.org/wiki/Client-side_scripting) (optional)__

With the Web and HTTP being the usual transport for implementing a RESTful service, constraints 1 through 4 are generally
understood. Also they are realized by components outside the scope of programmers such as proxies, servers, load balancers.
Of course implementors must follow a set of rules to create a well-bahaved service, but the first four constraints generally
cause least excitement and are well accepted. That is also partially true for the Uniform interface constraint. However
it is the crucial component and also very much different from the typical RPC architectural and behavioral styles, it
also causes most misunderstanding and heated discussion. Uniform interface states that:

* resources must be identified be identifiers, and that thy are separate from the resource representation
* the representation must be used to manipulate resources
* clients must communicate with the server using self-descriptive messages, that is the these message contain all information required to precess that request
* the client chooses state transitions from alternatives included in the representations (__Hypermedia as the engine of application state aka [HATEOAS](http://en.wikipedia.org/wiki/HATEOAS)__)

Lastly there is the only optional constraint, which states that servers can include (small?) fragments of code for the
clients to execute. These could be snippets in javascript or another scripting language, Flash components or even
compiled code in Java or another language.

## RDF

With the advent of the Semantic Web many have seen RDF as means to create RESTful services. What is RDF? A short for
Resource Description Framework, here's how it's described on [wikipedia](http://en.wikipedia.org/wiki/Resource_Description_Framework#Overview):

> The RDF data model is similar to classic conceptual modeling approaches such as entity&ndash;relationship or class
> diagrams, as it is based upon the idea of making statements about resources (in particular web resources) in the form
> of subject-predicate-object expressions.

That <em>subject-predicate-object</em> expressions, called __<em>triples</em>__ are the atoms of data in description of
a RDF resource. For example triple like

```
<http://t-code.pl/about#tomasz> <http://xmlns.com/foaf/0.1/name> "Tomasz Pluskiewicz" .
```

means that there exists a resource identified by URI <http://t-code.pl/about#tomasz> (<em>subject</em>), whose name
(<em>predicate</em>) is Tomasz Pluskiewicz (<em>object</em>). It is important to note that the predicate name is also
identified by a URI and thus is a resource itself too. This means that not only data can be shared but also the nature
of that data, which in an ideal world should allow clients to better understand that data and reason upon it. This is
in fact a one of the premises of the Semantic Web!

## RESTful RDF?

RDF does seem like a good match for REST. It it a logical extension to the existing Web. It uses URI identifier for
resources and those resources are decoupled from their representations. RDF resources can be represented using a wide
selection of serialization formats like Turtle or JSON-LD. Unfortunately RDF itself falls short of fulfilling the
complete set of REST constraints, because in itself it's not a hypermedia type. Hypermedia types are defined by
[Mike Amundsen](http://amundsen.com/hypermedia/) as follows

> Hypermedia Types are MIME media types that contain native hyper- linking semantics that induce application ow. For
> example, HTML is a hypermedia type; XML is not.

The most commonly used MIME for current Web Apis, JSON also is not a hypermedia type. This causes the clients to require
out-of-band information to interact with a service. Bare RDF is almost good enough to build read only API. For example,
given a triple (base URI)   We could attempt to retrieve a representation of the <em></em> resource. But what
if the resource is a web page (ie. has only a HTML representation available). Information about the nature of this
resource could be defined in the description of the <em></em> property, but RDF has no standard way of defining hypermedia
semantics. A bigger problem is encountered when one tries to build a read-write API based on RDF. For example here's a
list of users interests (in Turtle):

```
</tomasz> <interest> "rdf", "semantic web", "c#" .
```

How do we state that a new item can be added to the list? What request must be sent?

### Hypermedia RDF

It is easy to understand, given that RDF has evolved to be a flexible data model, that the hypermedia controls are
lacking. That is because RDF focuses on defining data structures and their relationships. __Hypermedia however is all
about behaviour__. There are a number of solutions, which intend to form a bridge between RDF and hypermedia, thus
making a truly RESTful service:

1. [Linked Data Platform](http://www.w3.org/TR/ldp/)
1. [RESTdesc](http://restdesc.org/)
1. [Hydra](http://www.markus-lanthaler.com/hydra/)

Each on of these approaches proposes a slightly different approach. Linked data platform is a set of guidelines, which a
conforming servers and clients should follow to allow a consistent interaction between them. RESTdesc enables server to
embed metadata about hypermedia included in the representation in the form of <em>if..then</em> rules expressed in
RDF, which define "<em>what it means to follow a link</em>". Hydra is similar to RESTdesc in that hypermedia cen be
included directly in representations but it also allows building a centralized metadata of possible interactions. Unlike
traditional API documetation, Hydra metadata is itself also RDF, which can be queried by the client at runtime to decide
what options are available for the next transition.

## What next?

In upcoming posts I will try to give a concise example of using Hydra and next I will try to express my ideas for
realizing the code-on-demand constraint by combining Hydra and [SPIN](http://spinrdf.org)
