
---
layout: post
published: true
title: Solitary event storming to discover application domain
date: 2016-03-30 10:55
categories:
- dajsiepoznac
- wikibus
- event storming
description: Event storming has its benefits even for one-man-army projects. Here are results of a short session I had
keywords: dajsiepoznac, event storming, ddd, domain-driven design
comments: true
---

Inspired by recent training sessions on [DRUG Software Craftmanship](http://www.meetup.com/drugpl/events/228508826/) and
another on the following week on [DDD Wro meetup](http://www.meetup.com/DDD-WRO/events/229281801/) I decided that it would
be best for me to explore the wikibus.org domain by conducting a solitary [**event storming**](http://ziobrando.blogspot.com/2013/11/introducing-event-storming.html).

<!--more-->

I took a stack of small post-its for marking book pages and a document folder to stick them ont. At first I wasn't very
much convinced that it was such a good idea. For one, the application is seemingly just simple CRUD but quickly storming
through some events that came to my mind confirmed that there may be more complexity that meets the eye. Also some events
helped me discover possible aggregate roots and entities and relationships between them.

[![events on small post-its](/uploads/2016/03/wikibus-events-small.jpg)](/uploads/2016/03/wikibus-events-large.jpg)

* **Datasheet added for classification**

   It is easy to think about vehicles as a whole and keep them in the database as such. However due to the variety of 
   makes and models I decided that it will be better to keep technical details as a separate entity.

* **Datasheet added to Vehicle**
* **Datasheet moved between Vehicles**

   This way it will be easier to treat a *Vehicle* as the sum of its *Datasheets* and if necessary any Vehicle it would
   be possible to split a vehicle in two   

* **Datasheet Source added**

   Given my brochure and book collection I want to keep track of where the *Datasheet* comes from. Sources would also have
   to include simple link for example to wikipedia.

* **Engine extracted from Datasheet**
* **Gearbox extracted from Datasheet**

   *Datasheets* often contain additional structured information about internal components like engine, gearbox and axles.
   I would like to be able to keep a separate structured representation and not only textual description 

* **Vehicle created**
* **Vehicle marked as defunct**

   I'm unsure about this one. It should be possible to infer that information from production end date. However that may
   not always be available, so maybe there is some merit.

* **Added external link to Vehicle/Manufacturer/Brand**
* **Brand created**
* **Manufacturer created**
* **Manufacturer Merger added**

  Lastly there is *Manufacturer* and *Brand*. The distinction is important, because a Manufacturer can own multiple
  brands (for example [FAP](https://en.wikipedia.org/wiki/Fabrika_automobila_Priboj), which produced under own brand and
  marketed some buses under the [Sanos](https://en.wikipedia.org/wiki/FAS_Sanos) name) and it is even possible that same
  brand name is used by different manufacturers (such [Ikarus from Hungary](https://en.wikipedia.org/wiki/Ikarus_Bus) and
  [Ikarbus](https://en.wikipedia.org/wiki/Ikarbus#Products), which used the name Ikarus for some time)

* **Manufacturer Transformation added**

  Also it is not uncommon for a brand to close and continue under a different name. This is the case for example with
  Britain's [Optare](https://en.wikipedia.org/wiki/Optare), which for a time operated as [NABI](https://en.wikipedia.org/wiki/North_American_Bus_Industries) 

* **Vehicles grouped as Series**
* **Vehicle hierarchy changed**
* **Relationship between Vehicles created**

  Vehicles can form simple hierarchies and series, such as subsequent modernizations of a specific model, but also more
  complex relations are possible. For example a city bus can be tha basis for a twin trolleybus. Compare [Solaris Urbino
  12](https://en.wikipedia.org/wiki/Solaris_Urbino_12) and [Solaris Trollino 12](https://pl.wikipedia.org/wiki/Solaris_Trollino_12)
  
* **Influential Person added to Manufacturer**
* **Interesting Fact/Date added**

  These are relatively unrelated to the core concepts. 

* **Manufacturer marked as defunct**

  Finally this one I never thought about before. This is similar to marking a *Vehicle* as no longer in production
  
## Insight

I was pleasantly surprised with even a solo event storming. It helped me look at a slightly different angle on the problem
space and determine some domain object boundaries and possible functionalities. I will definitely do that again in this
or other projects.

For more about event storming you should click these links

1. [http://ziobrando.blogspot.com/2013/11/introducing-event-storming.html](http://ziobrando.blogspot.com/2013/11/introducing-event-storming.html)
1. [http://www.slideshare.net/ziobrando/event-storming-recipes](http://www.slideshare.net/ziobrando/event-storming-recipes)
