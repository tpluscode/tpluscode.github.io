---
layout: post
published: true
title: REST misconceptions part 0 - Do you really understand the REST?
date: 2016-02-20 14:40
categories:
- rest
- hypermedia
description: Introduction to a series of posts discussing common mistakes being made
comments: true
---

This is the first in a series of posts where I want to discuss misconceptions about the REST architectural style. 
Much has been written and told about REST, yet there are a number of common mistakes prevalent in the community. In 
this post I will introduce (again) the basics of REST as defined by Roy T. Fielding.

<!--more-->

In this series:

1. Misuse of URIs
1. Not linked enough
1. Leaky business
1. Resources are application state
1. REST "documentation"

Boy, have we been chasing our own tails since the year 2000? Why 2000, you ask? That's when Roy T. Fielding published his
famous dissertation titled *Architectural Styles and the Design of Network-based Software Architectures*. This groundbreaking
piece of work has spurred interest in simplifying web applications' design. REST is seen as a fat-free alternative to
SOAP. The same wave helped JSON gain great advantage over XML we see today. The analogy goes deeper. Both REST and JSON
miss many features offered by their predecessors but apparent simplicity caused an explosion of their adoption. 

## Is REST really so simple?

The acronym is expanded as **Representational State Transfer**. In plain English, it means that clients use **representations**
to **transfer** between applications **state**. It's important to understand these three terms:

1. **Representation**, means a representation of resource. More about that below.
1. **State** is the client application state, which consists of one or multiple resource representations
1. The client can **transfer** between states by accessing and manipulating resources. In the case of HTTP this means
invoking GET/PUT/POST/etc methods on them and incorporating the response as (part of) the next application state 

The most appealing definition of REST that I've [come across](http://stackoverflow.com/a/9169270/1103498) states that in REST

> each endpoint **RE**presents a **S**tate **T**ransfer

This is a very good summary of what I wrote above: The endpoint is a resource (accessed via URL) and its representation
contains information about possible state transfers.

### Let the author speak

To better understand the building blocks of REST let's see how dr Roy Fielding defines it (emphasis mine).
 
> [REST is an] architectural style for **distributed hypermedia** systems

This may be a little cryptic but is actually a very good description. REST helps build scalable and maintainable web 
applications or APIs by introducing a number of constraints, which must be satisfied in order to call an application truly
*RESTful*:

1. Client-server
1. Stateless
1. Cache
1. Layered system
1. Code on demand
1. Uniform interface

As it is often the case, each of those constraints comes at a price. Thus not every application has to be really 
REST-compliant. Yet REST has become such a popular buzzword that everyone wants in and call their APIs RESTful with
disregard of what the term actually means. So what does it mean? Let's look closer at the constraints.

## REST constraints

The first five constraints are relatively simple, because the are in line with the web architecture and the HTTP protocol.

### Client-server

The client-server constraint states that there must be a clear separation of concerns between the data storage and user 
interface. Such that they can evolve independently of each other. This separation also improves portability across multiple
platforms.

The client-server is well understood, because this is how the web works. This is where REST differs from RPC-style
architectures, which extend the server programming interface to the client so that they can be seen as one. Needless to
say it impedes evolvability by introducing a strong dependency on the server.

### Stateless

Stateless communication is another well appreciated constraint, because it's benefits are very clear. Statelessness means 
that the server must not keep any information about client-server interaction. REST discourages the use of server-side 
session. That way it is possible to scale the server without ever breaking the clients. The downside is that potentially
more data is sent repetitively in each request.

This one doesn't cause any problem, because the cons of using a server-side session are well understood.

### Cache

REST requires that requests can be cached to decrease network load and improve performance. The server must have the 
ability to explicitly declare that an individual resource is cacheable or not.
  
Cache is very common in web applications, because it greatly decreases the amount of data sent from the server. It
especially useful for data that doesn't change often like static content, stylesheets, images, etc.

### Layered system

Another constraint easily achieved when implemented over the current web. The web architecture already includes multiple 
layers, which are transparent to the client: load balancers, proxies, cache, content delivery networks. The client must
never know whether it communicates with the server itself or a middleware.

### Code on demand

The last of the "easy" constraints is a bit of an oddball, because it is the only *optional* constraint. It allows the 
server to extend clients' functionality by serving code to be executed. It is optional, because it is never possible
to extend every client. For example a server could serve portions of javascript code, by that would only be executed by 
web browsers. Other type of clients wouldn't be able to run that code and thus the constraint cannot be made mandatory.

### Uniform interface

The last constraint is arguably the most important and Roy Fielding calls it a *central feature* of the REST architectural
style. Its aim is to simplify the overall architecture by further decoupling clients from servers. It is done by using a
standardized rather than application-specific format for communication. The cost of such approach is possible decrease in
efficiency where the data has to be transformed. This constraint is defined by four subconstraints, which realize this 
decoupling.

#### Identification of resources

Each resource in a RESTful system is assigned a URI identifier. The identifier is used to access a resource representation
(see below). It is important that other than being a pointer to the resource, ths identifier doesn't bear any extra 
semantics. I will elaborate on that in future posts because violating this rule is a most common mistake and cause for
trouble.

#### Manipulation of resources through representations

As I've already stated, the resources are accessed with URIs but the server exposes representations and not resources
themselves. This is the biggest difference from RPC-style APIs, where the client operates through a proxy on the actual
server-side objects as if they were local. This can be seen in CORBA or RMI or WCF. 

It is also important to understand that a single resource can be represented in various ways. A resource can be represented 
as JSON, XML or even an image. Representations are identified by media types such as application/json, application/xml or
image/png. In addition to the resource data representations also include metadata and control data. For example cache
rules like expiration date.

Lastly, representations are used to capture the indented state of a resource. In RPC the client operate on resources in
an object-oriented fashion. There could be a operation which states **publish this document**. REST however doesn't work
that way. To achieve a similar business operation, a REST client could change the state of the representation and update
the resource by submitting the changed data. With HTTP this would involve a PUT operation on the resource in question.
Another option is to send the representation to another resource, which implements the business logic. This could be
implemented as performing a POST operation on a resource, which contains all published documents.
 
{% highlight http %}
POST /published-documents

{
  // the document to publish
}
{% endhighlight %}

#### Self-descriptive messages

This constraint should be simple. It means that the resource representations and all metadata attached should be everything
the server and clients need to act:

* parsing and semantic rules are defined by the media-type
* caching rules are included as appropriate and well-known headers
* links to other resources are never hidden in client logic but made explicit

Self-descriptiveness also makes it possible for intermediaries/middleware to operate independent of clients, servers and
application-specific rules and most importantly agnostic of changes to those rules.

#### Hypermedia as the engine of application state

The last constraint, sometimes written as the ugly acronym **HATEOAS**, is the quintessence of REST. I sometimes think 
that instead of talking about REST we should be talking about Hypermedia. Without rich hypermedia the API cannot be 
truly RESTful, only REST-like or REST-ish. 

What does hypermedia mean? It means data in various formats, which is all linked by hyperlinks. The last constraint is a
composition of all the others, because for an application to act upon the resource representation it requires multiple
elements, all of which are defined by the REST constraints. Most notably:

1. The media type must be known to the client and rich enough to describe all possible client-server interaction
1. The client can only follow links included in the representation and cannot construct identifiers without user interaction

## Coming up next

Unfortunately practice shows that adhering to the REST principles and even understanding them is quite challenging. Many
misconceptions come as a result of following the path of least resistance. It is easier to break some rules to achieve a
goal quicker, even if there are adverse consequences in the long run.
 
In future posts I will give common examples of REST principles being broken and some ideas for improvement. 