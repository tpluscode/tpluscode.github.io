---
layout: post
published: true
title: Declarative UI "routing" with Web Components
date: 2015-02-01 10:00
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
<script src="/bower_components/webcomponentsjs/webcomponents.min.js" ></script>
<link rel="import" href="/bower_components/google-map/google-map.html" />

<style>
    google-map {
        height: 400px;
        display: block;
        margin-top: 15px;
        margin-bottom: 15px;
    }
</style>

<google-map latitude="51.110921" longitude="17.028160" zoom="15">
  <google-map-marker latitude="51.110921" longitude="17.028160"
                     title="Wrocław .NET user group">
    <a href="http://wrocnet.github.io" target="_blank">
      <img src="http://wrocnet.github.io/images/logo.png" alt="wrocnet logo" />
    </a>
  </google-map-marker>
</google-map>
```

<script src="/bower_components/webcomponentsjs/webcomponents.min.js" ></script>
<link rel="import" href="/bower_components/google-map/google-map.html" />

<style>
    google-map {
        height: 400px;
        display: block;
        margin-top: 15px;
        margin-bottom: 15px;
    }
</style>

<google-map latitude="51.110921" longitude="17.028160" zoom="15">
  <google-map-marker latitude="51.110921" longitude="17.028160"
                     title="Wrocław .NET user group">
    <a href="http://wrocnet.github.io" target="_blank">
      <img src="http://wrocnet.github.io/images/logo.png" alt="wrocnet logo" />
    </a>
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

### So where is the model actually? And how is it retrieved? 

The approach to build UI based on a model has an important implication - it has to be connected to some remote (RESTful)
data source. Because the `<ld-presenter>` is only responsible for handling UI changes, a separate object is needed to
retrieve the model. 

Speaking of single responsibilities, the `<ld-presenter>` should probably work simply by being bound to the object displayed.
This would be achieved by setting a model attribute on the presenter's node.

``` html
<!-- set declaratively -->
<ld-presenter model="{{ boundModel }}" id="main-content">
  <!-- routes here -->
</ld-presenter>

<!-- set from javascript -->
<script>
  var model = { };
  document.querySelector("#main-content").model = model;
</script>
```

Either way the model must come from somewhere. For a complete solution the [Flux pattern from Facebook][flux] can be used
to achieve low coupling. Out of a number of solutions [reflux][reflux] appealed to me most, but the idea is similar
regardless of the implementation. The idea behind Flux is that all communication should be unidirectional. The views fire
actions, which are simply events. Those events are handled by stores. Stores are anything ranging from simple local storage
to proxies for a remote service. When stores are ready they also signal changes via events to all listening views so
that the can be updated. 

![flux](/uploads/2015/02/flux.png)

What's important, is that stores and views never communicate directly. This way it is easier to keep things decoupled and
synchronized. Note that in Reflux's case there is no dispatcher. Stores listen directly to actions.

### Using Reflux to handle a Linked Data API

Because in Linked Data any identifier is a URI, readible links can be rendered simply as an anchor `<a>`. Let's take a
simple JSON-LD model of a person (`@context` ignored for brevity):

``` javascript
{
  "@id": "/person/tomasz"
  "foaf:givenName": "Tomasz",
  "ex:friends": {
    "@id": "/person/tomasz/friends"
  }
}
```

That model could be displayed using the template below (think Polymer/mustache syntax)

``` html
<template>
{% raw %}<p>Hi, my name is {{ model['foaf:givenName'] }}</p>{% endraw %}
  <p>
    Here's a list of my 
{% raw %}    <a id="friendsLink" href="{{ model['ex:friends'] }}">friends</a>.{% endraw %}
  </p>
</template>
```

The link will by default navigate the browser to a new address, so the click event must be handled to prevent that from
happening. Instead an action will be triggered. Below is how that could work with Reflux and requirejs. First we define
the actions.

``` javascript
define('navigation', ['Reflux'], function(Reflux) {
	return Reflux.createAction({
    children: [ 'success' ]
  });
});
```

We fire the action when the link is clicked.

``` javascript
require(['navigation'], function(navigation) {
  var friendsLink = document.getElementById('friendsLink');
  friendsLink.addEventListener('click', function(ev) {
    ev.preventDefault();
  
    navigation(ev.target.href);
  });
});
```

It is handled in a store. When that happens, a GET request is fired. After the request has been processed (JSON-LD here),
it is forwarded with the child action `success`.

``` javascript
define(
  'modelStore', 
  ['navigation', 'jsonld'], 
  function(navigation, jsonld) {
    var promises = jsonld.Promises;

    return Reflux.createStore({
      model: {},
      init: function() {
        this.listenTo(navigation, this.loadResource);
      },
      loadResource: function(uri) {
        var self = this;
      
        executeXhr(uri)
          .then(function(resource) {
            return promises.expand(xhr);
          })
          .then(function(expanded) {
            navigation.success(expanded);
          });
      }
    });
  }
);
```

Lastly the `navigation.success` action is handled to update the ld-presenter.

``` javascript
require(['navigation'], function(navigation) {
  navigation.success.listen(fuction(resource) {
    var presenter = document.querySelector('ld-presenter');
    
    presenter.model = resource;
  });
});
```

### Rough edges

My current [experiment I've implemented][polymer-flux] more or less follows this pattern but the `<ld-presenter>` 
(there called `<hydra-router>`) is tied to the navigation actions, which means that anyone using such presenter is 
automatically required to use Reflux. Real presenter should be independent from any third party components. Such
integration could be achieved with minimal javascript code. Preferably by [extending the custom element][extend] or
inside an angular directive, etc.

Also with a hard dependency on navigation action, any instance of the presenter element in DOM would every time react to 
the action being fired. This may be less than ideal when multiple and maybe nested presenters are used on a page. In a 
real app there could be multiple model stores for various parts of the UI like main menu or master-detail kind of view.

[wc]: http://webcomponents.org/
[eric]: https://twitter.com/ebidel
[shift]: http://webcomponents.org/presentations/web-components-a-tectonic-shift-for-web-development-at-google-io/
[shadow]: http://w3c.github.io/webcomponents/spec/shadow/
[imports]: http://w3c.github.io/webcomponents/spec/imports/
[custom]: http://w3c.github.io/webcomponents/spec/custom/
[templates]: https://html.spec.whatwg.org/multipage/scripting.html#the-template-element
[approuter]: https://github.com/erikringsmuth/app-router
[srp]: http://www.oodesign.com/single-responsibility-principle.html
[flux]: https://facebook.github.io/flux/
[reflux]: https://github.com/spoike/refluxjs
[polymer-flux]: https://github.com/tpluscode/polymer-flux/tree/master
[extend]: http://www.html5rocks.com/en/tutorials/webcomponents/customelements/
