---
layout: post
published: false
title: Declarative UI "routing" with Web Components
date: 2015-01-27 10:00
categories:
- html
- js
description: Managing application state in a RESTful client in a declarative way
comments: true
---

For a long time now W3C has been working on [Web Components][wc], the groundbreaking
specification, which will dramatically change the way web applications are
created. Google's own [Eric Bidelman][eric] calls it a [Tectonic Shift][shift]
and for good reason.

Lately I have been considering employing Web Components in my ever-upcoming hobby
project. The missing piece I haven't found in modern web app frameworks is UI
based on application state (think [REST][rest]). Typically the UI displayed to the use
is tied to the route - or address, which is potentially brittle and not ideal for
a truly [hypermedia-driven application][hateoas].

<!--more-->

I have already written about [Hypermedia-driven applications with RDF
backend](/2014/06/rest-rdf-and-hypermedia/). There I explained what is REST and
how it fist the Semantic Web. This time I'll delve into effectively managing
client state using resource representations. Although I'm still in the RDF land
the ideas are applicable to any hypermedia-driven application.

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

> 1. Client clicks a link
> 2. A route is matched to the path
> 3. A request is made based on route's parameters
> 4. Route's view is rendered from the returned model

There is more than one issue here. Managing the route paths is unnecessary burden.
And what if the server returns something we didn't expect? Not to mention that
parametrized routes are effectively holding developers back from building
real self-descriptive back ends. We are effectively falling back to inferior design
and the real gain is usually increased maintenance.

### HATEOAS as if you meant it

The only solution I've found that sports a different way for driving client's
state

[wc]: http://webcomponents.org/
[eric]: https://twitter.com/ebidel
[shift]: http://webcomponents.org/presentations/web-components-a-tectonic-shift-for-web-development-at-google-io/
[rest]: http://ruben.verborgh.org/blog/2012/08/24/rest-wheres-my-state/
[hateoas]: http://restcookbook.com/Basics/hateoas/
