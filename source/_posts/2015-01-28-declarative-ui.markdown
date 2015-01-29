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

<!--more-->

In my [previous post]({{page.previous.url}}) I proposed a novel way for managing the application state of RESTful
clients - that is clients of RESTful services. To recap, the idea is that the user interface should be rendered first
and foremost based on the resource returned by the server rather. I propose that is an alternative to client-side
URL routing.

## Web Components

I will be showing examples written with custom elements - part of an upcoming W3C standard, which will allow creating
custom HTML elements. Those custom elements act like the standard HTML tags, accepting attributes and exposing methods
and firing events. Altogether the Web Components specification will define four complementary standards:

 * [Shadow DOM][shadow] - allowing encapsulation and separation of markup and CSS
 * [Templates][templates] - for defining reusable portions HTML (not just text)
 * [Imports][imports] - so that elements can be loaded on demand
 * [Custom elements][custom] - to enrich HTML with custom, semantically significant elements

Combined, though each could be used separately if needed, these standards empower web developers to create web applications
in ways unimagined before. For example, there is a custom google maps element, which makes adding a map to your page as
simple as shown below.

``` html
<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.5.2/webcomponents.min.js" />
<link rel="import" href="http://googlewebcomponents.github.io/google-map/components/google-map/google-map.html" />

<style>
    google-map {
        height: 200px;
    }
</style>

<google-map latitude="51.110921" longitude="17.028160">
  <google-map-marker latitude="51.110921" longitude="17.028160"
                     title="Wrocław .NET user group">
    <img src="http://wrocnet.github.io/images/logo.png" alt="wrocnet logo" />
  </google-map-marker>
</google-map>
```

<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.5.2/webcomponents.min.js" />
<link rel="import" href="http://googlewebcomponents.github.io/google-map/components/google-map/google-map.html" />

<style>
    google-map {
        height: 200px;
    }
</style>

<google-map latitude="51.110921" longitude="17.028160">
  <google-map-marker latitude="51.110921" longitude="17.028160"
                     title="Wrocław .NET user group">
    <img src="http://wrocnet.github.io/images/logo.png" alt="wrocnet logo" />
  </google-map-marker>
</google-map>

No boilerplate JavaScript that would traditionally obscure intent. _And_ it would be so much easier to replace Google
map with [Yandex](https://github.com/just-boris/polymer-ymaps), [Open Street Map](https://github.com/ruben96/open-map),
[Leaflet](https://github.com/nhnb/leaflet-map) or [other from custom elements](http://customelements.io/?q=map).

__Note__ The `webcomponents.js` is a polyfill currently required for browsers other than Chrome and Opera.

You can find dozens more components on [component kitchen](http://component.kitchen/), [customelements.io](http://customelements.io/)
and [some more experiments by google](http://googlewebcomponents.github.io/).

I really, really love how Web Components turn the traditional [`<div><soup>`](http://drupal.stackexchange.com/questions/2917/can-you-do-anything-about-the-div-soup)
into ___meaningful___ code. They are a tool for creating [Domain-Specific Language](http://en.wikipedia.org/wiki/Domain-specific_language) for HTML.

## Routing with Custom Elements

There is a neat component, which implements traditional URL routing as a custom [`<app-router>`][approuter] element.

``` html
<app-router>
  <!-- matches an exact path -->
  <app-route path="/home" import="/pages/home-page.html"></app-route>

  <!-- matches using a wildcard -->
  <app-route path="/customer/*" import="/pages/customer-page.html"></app-route>

  <!-- matches using a path variable -->
  <app-route path="/order/:id" import="/pages/order-page.html"></app-route>

  <!-- matches a pattern like '/word/number' -->
  <app-route path="/^\/\w+\/\d+$/i" regex import="/pages/regex-page.html"></app-route>

  <!-- matches everything else -->
  <app-route path="*" import="/pages/not-found-page.html"></app-route>
</app-router>
```

It supports imported and inline templates, binding to route parameters and all other features found in all-javascript
routers.

It is still URL-routing though. Also the approach to handle routing and browser history in one component violates the
[single responsibility principle][srp] IMO.

## Linked Data to the rescue

The `<app-router>` component is a great base, which can be adapted to handle REST models. Below is my idea, which I have
been experimenting with by modifying the app-router's code, thus retaining the template loading functionality and events.

``` html
<ld-presenter id="main-content">
  <!-- load a view asynchronously for Person -->
  <ld-view type="http://schema.org/Person" import="/views/person.html"></ld-view>

  <!-- no type attribute would match anything -->
  <ld-view>
    <template>
      Sorry, unsupported model
    </template>
  </ld-view>
</ld-presenter>
```

Unlike `<app-router>` I think that `<ld-presenter>` should only handle selecting a view to honour the [Single
Responsibility Principle][srp]. History could be handled by another custom element created for that specific task:

``` html
<ld-history baseUri="http://example.com/my-api/" ></ld-history>
```

Dropping the above anywhere in the page would automatically change the page URL (by using hashes or HTML5 history)
whenever the model changes.

### So where is the model actually?

I like the

[wc]: http://webcomponents.org/
[eric]: https://twitter.com/ebidel
[shift]: http://webcomponents.org/presentations/web-components-a-tectonic-shift-for-web-development-at-google-io/
[shadow]: http://w3c.github.io/webcomponents/spec/shadow/
[imports]: http://w3c.github.io/webcomponents/spec/imports/
[custom]: http://w3c.github.io/webcomponents/spec/custom/
[templates]: https://html.spec.whatwg.org/multipage/scripting.html#the-template-element
[approuter]: https://github.com/erikringsmuth/app-router
[srp]: http://www.oodesign.com/single-responsibility-principle.html