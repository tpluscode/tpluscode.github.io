---
layout: post
published: false
title: Technology side of wikibus.org
date: 2016-03-08 22:40
categories:
- dajsiepoznac
- wikibus
description: I'm sharing more details about wikibus.org technology stack and my plans
comments: true
---

I just noticed that I forgot to change the permalink of my last post. I intended to write about tech, but ended up writing
about buses only. Too bad, but I'm not going to change that now. I thins post I will write a little bit more about what
I'm actually implementing for wikibus.org

<!--more-->

Implementing all of it may be a daunting task. Because I want to build an entire website and API I'm aiming for the 
full-stack. On top of that I want to actually do something cool :sunglasses:, which for developers mean using a really
cutting-edge technology or publishing a reusable package. 

And so my goals here are quite ambitious. I am
 
* using RDF for as my data structures, 
* want to implement the domain CQRS-style as event-sourced async models,
* use Nancy to serve data from the server because Web API sucks balls,
* hope to create a ***real*** REST API with the help of [Hydra][hydra],
* intend to use Web Components and Polymer in the browser to consume my API.

## Divide and conquer

Because there's a lot of pieces to this bus-lovers' puzzle, I created a [wikibus organization][wikibus-gh], where I keep
separate repositories for each element. Except the dedicated front and back end I intend to keep the other libraries as
independent as possible so that they can be reused in other projects. I for one will be publishing my reusable code on
[NuGet](http://nuget.org).

### [wikibus backend][back]

This is the main API and server side, where all the Nancy code and data-access will live. I will need a number of components 
to make it happen. Not all of it is available as open-source packages just yet, so I'm left with no choice but to implement
some :shit: myself.

Currently I've just hit a 0.1 mark with an updated a deployable database of brochures. In a short future I will publish
a post where I share some details about how I convert my data from SQL Server to RDF and test the results.

The main interest of wikibus.org will of course be the [knowledge about public transport][bus-post]. Because of the complexity 
I probably will use a form of CQRS with eventually consistent RDF models. This will hopefully buy me flexibility in adapting to
changes in how I want to process raw data. We'll see.

### [JsonLD.Entities][JsonLD.Entities]

![json-ld entities logo](https://raw.githubusercontent.com/wikibus/JsonLD.Entities/master/assets/icon.png)

First component I've built as a reusable library is a simple serializer, which can convert POCO object to [JSON-LD][jld]
and vice versa. It is basically an extension of the immensely popular [Newtonsoft.Json][Newtonsoft.Json] package. I wanted
too keep JsonLD.Entities as simple as possible and so most of it works by convention.
 
There are some [examples](https://github.com/wikibus/JsonLD.Entities/tree/master/src/Documentation) and this package is
the first wikibus library already available on [nuget](https://www.nuget.org/packages/JsonLd.Entities/).

### [www.wikibus.org][www.wikibus.org]

Lastly here's the main front-end library. I've purchased a bootstrap template ages ago and started some work on that ages
ago but there is a lot I want to accomplish in this space too:

* use Polymer (styling will be tricky with Shadow DOM)
* consume Hydra - I hope to use an existing library; maybe [hyjax](https://github.com/n-fuse/hyjax)
* be really RESTful

[hydra]: http://hydra-cg.com
[wikibus-gh]: http://github.com/wikibus
[back]: http://github.com/wikibus/wikibus-backend
[www.wikibus.org]: http://github.com/wikibus/www.wikibus.org
[JsonLD.Entities]: http://github.com/wikibus/JsonLD.Entities
[bus-post]: /2016/03/wikibus-technology-details/
[jld]: http://json-ld.org
[Newtonsoft.Json]: http://json.net
