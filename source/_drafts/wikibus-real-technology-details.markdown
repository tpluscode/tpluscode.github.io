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
separate repositories for each element.

* [wikibus backed][back]

  This is the main API and server side, where all the Nancy code and data-access will live. I will need a number of components 
  to make it happen. Not all of it is available as open-source packages just yet, so I'm left with no choice but to implement
  :shit: myself.
  
  * [JsonLD.Entities][JsonLD.Entities]
  
    A simple

* [www.wikibus.org][www.wikibus.org]

  The main front-end repository. 

[hydra]: http://hydra-cg.com
[wikibus-gh]: http://github.com/wikibus
[back]: http://github.com/wikibus/wikibus-backend
[www.wikibus.org]: http://github.com/wikibus/www.wikibus.org
[JsonLD.Entities]: http://github.com/wikibus/JsonLD.Entities