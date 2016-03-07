---
layout: post
published: true
title: Why I like buses - more about wikibus.org
date: 2016-03-07 22:40
categories:
- dajsiepoznac
- wikibus
description: I'm sharing more details about wikibus.org technology stack and my plans
comments: true
---

Previously, in my first [#dajsiepoznać post][dsp-start], I wrote about how I've been *trying* to create wikibus.org, the
public transport encyclopedia. Sadly, Most of that *development* has been more of blind technology exploration, learning
and very little delivery. Now, I'm going forward with renewed strength, and I'd like to share more details about the
idea behind the project.

<!--more-->

## Business domain of public transport

Public transport is complex. By that I mean just the technology, and not even how it is organized. For the sak of this
post let's focus on buses. To most people buses are somewhat similar. To me however they are a whole world of complex 
relations and classifications. 

### What bus am I looking at?

There are many aspects, which characterize a bus.

* Size, typically divided into subclasses by length and capacity
   * MINI
   * MIDI
   * MAXI
   * MEGA
* Purpose
   * City bus
   * Suburban bus
   * Intercity bus
   * Coach/Tourist bus
   * Airport bus
   * Other
* Drive
   * Diesel
   * Petrol
   * Liquid gas
   * Ethanol
   * Electric
   * Hybrid 
* Single or double deck
* Articulated or not

And the list above doesn't include obvious characteristics such as physical dimensions, design details and performance. 
And there are also trolleybuses, which often share similarities in terms of common design.

### So what do I call this bus, again?

There is also another problem, especially with old designs. Historically buses were built as separate chassis and body.
In the early days chassis were mostly modified lorry version and only later specialized bus-only designs emerged. And so
a single type of chassis could receive a wide variety of bodies, often with very distinct design. And the same body would
be used on a number o chassis by various manufacturers.

![Plaxton panorama](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/East_Kent_WJG_470J.JPG/640px-East_Kent_WJG_470J.JPG)

Above is a [Plaxton Panorama][panorama], which can be built on many chassis by many manufacturers. Common examples would
include [Volvo B58](http://dbpedia.org/resource/Volvo_B58), [Leyland Leopard](http://dbpedia.org/resource/Leyland_Leopard)
or [AEC Reliance](http://dbpedia.org/resource/AEC_Reliance). At the same time other bodies were available for each of those
chassis. This is a surprisingly complex graph structure. To add to the mix is that each combination of the two would be
called either after the body or the chassis depending on who you ask and the context.

## Buses are just the tip of the iceberg

As I said. There is much more to public transport that buses. I'm interested in all of that.
I hope that this should give you a glimpse in why I'm interested in this subject, find it interesting. My best case
scenario goal is a comprehensive database where all these intricate details and relations can be explored and discovered.

[dsp-start]: /2016/03/dajsiepoznac-wikibus/
[panorama]: https://en.wikipedia.org/wiki/Plaxton_Panorama_Elite