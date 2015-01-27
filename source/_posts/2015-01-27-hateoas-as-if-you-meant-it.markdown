---
layout: post
published: true
title: HATEOAS as if you meant it
date: 2015-01-27 21:00
categories:
- html
- js
description: Managing application state in a RESTful client in a declarative way
comments: true
  - hateoas
---

Lately I have been considering employing Web Components in my ever-upcoming hobby
project. The missing piece I haven't found in modern web app frameworks is UI
based on application state (think [REST][rest]). Typically the UI displayed to the use
is tied to the route - or address, which is potentially brittle and not ideal for
a truly [hypermedia-driven application][hateoas].

<!--more-->

I have already written about [Hypermedia-driven applications with RDF
backend](/2014/06/rest-rdf-and-hypermedia/). There I explained what is REST and
how it fist the Semantic Web. This time I'll delve into effectively managing
client state using resource representations.

## Haters gonna HATEOAS

_FYI I pronounce HATOAS as __hideous___

REST has become a de-facto standard for many we services out there. Actual
understanding varies but the general community has long ago recognized its
elegance in building services. At the same however there has been too little
adoption of what many find the crucial bit - Hypermedia. The idea is strikingly
simple: whatever the server returns is enough for clients to perform all
subsequent requests.

But lets ignore that fact for now and assume we built a perfect, holy grail
HATEAOS server and now need a client. In JavaScript, so that we're trendy
:sunglasses:.

## Managing application state

### Routing

Modern JavaScript frameworks typically manage their UI state with routing, which
means that each application state is bound to a specific path. It works this way
in every major contender.

[Ember](http://emberjs.com/guides/routing/defining-your-routes/):

``` js
App.Router.map(function() {
  this.route("about", { path: "/about" });
});
```
[Angular's ng-router](https://docs.angularjs.org/api/ngRoute/service/$route#example):

``` js
$routeProvider
  .when('/Book/:bookId', {
    templateUrl: 'book.html'
  })
```

[Angular's ui-router](https://github.com/angular-ui/ui-router):

``` js
$stateProvider
  .state('state1', {
    url: "/state1"
  })
})
```

The list could go on and include Backbone, Durandal, Knockout routers and standalone
solutions.

This approach doesn't work very well with a truly hypermedia-driven API where the
state of an application is determined by the server's response. The problem is
that the flow is reversed. With routing client-side navigation works like this:

> 1. User clicks a link
> 2. A route is matched to the path
> 3. Client performs a request to the server
> 4. Server returns a resource
> 5. Route's view is rendered

There is more than one issue here. Managing the route paths is unnecessary burden.
And what if the server returns something we didn't expect? Not to mention that
parametrized routes are effectively holding developers back from building
real self-descriptive back ends by introducing out-of-band information. After all
the REST paradigm states that the resource is the one and only place where clients
get information necessary to perform requests. Path on the client is not.

We are inadvertedly falling back to inferior design and the real "gain" is usually increased maintenance.

### HATEOAS as if you meant it

To my surprise and despair I haven't found a real solution for resource-based
navigation. With Hypermedia-driven APIs the resource is king - as per the __R__ in REST.
As described by Ruben Verborgh in his [post][rest]:

> Application state is information about where you are in the interaction.
> Changes to this state are possible by the controls in hypermedia representations.

Here's how I see the process of changing the application state.

> 1. User clicks a link/posts a form/etc.
> 2. The client performs a request to the server
> 3. Server returns a resource
> 4. Application state is changed (or not)

There a some very important implications of such approach. There is no notion of a route or path.
At least it is not necessary for the client-server interaction. This means however that the
requested address must be included in the hyperlink or form.

Is it possible now? To some extent yes! Every hypermedia-aspiring media type, which
includes links and operation definitions, like [Hydra][Hydra] but also even [HAL][HAL]
and [SIREN][SIREN] and others, empower to developers to build clients actually driven
by that hypermedia. At least to some extent. Yet we still don't!

## Linked Data to the rescue

In my eyes the root of the problem is refusal of using URIs as identifiers. I get the impression
that URLs, even in RESTful services, are an afterthought. Or at least a derivative of some other
identifier scheme, like database primary keys or user-supplied values. With such mindset it is
natural that that __true__ identifier would be used as part of a route, say `user/:id` only so
that `user/10` it is later transformed into the __secondary__ id (URL) like `http://example.com/users/10.json`
or whatever.

With Linked Data the URI is king. If you accept the fact that your resource is identified by the
address `http://example.com/users/10`, there will be little incentive to unnecessarily transform it.
Of course in real-life web application one would prefer `http://example.com/app/#!/users/10`
over an ugly slug similar to `http://example.com/app/#!/http://example.com/users/10`. Still this is not only
browser-specific and originally a solution for handling history in single-page applications but
actually completely optional. A hypermedia-driven web app can happily work without any routing and
browser history management. Granted it may be unfriendly and not bookmarkable beyond the entry point,
but __it will still work__.

## Further read

In a future post I'll try to give some concrete examples of how I imagine implementing a browser
client driven by a Linked Data API.

[wc]: http://webcomponents.org/
[eric]: https://twitter.com/ebidel
[shift]: http://webcomponents.org/presentations/web-components-a-tectonic-shift-for-web-development-at-google-io/
[rest]: http://ruben.verborgh.org/blog/2012/08/24/rest-wheres-my-state/
[hateoas]: http://restcookbook.com/Basics/hateoas/
[Hydra]: http://www.markus-lanthaler.com/hydra/
[HAL]: http://stateless.co/hal_specification.html
[SIREN]: https://github.com/kevinswiber/siren