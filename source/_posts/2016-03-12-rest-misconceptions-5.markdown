---
layout: post
published: true
title: REST misconceptions part 5 - REST "documentation"
date: 2016-03-12 17:50
categories:
- rest
- hypermedia
description: I'm sick and tired of seeing all the approaches of so-called REST API documentation. This has to stop 
comments: true
---

In this installment of my REST series I will take on the train wreck, which some people call REST API documentation. Of
course some form of documentation is necessary but I am growing more and more disappointed with most current solutions.
Tools like swagger or apiary can be used to create some sort of documentation, but they sure as hell don't describe REST
APIs.

<!--more-->

In this series:

1. [Introduction](/blog/2016/02/rest-misconceptions-0)
1. [Misuse of URIs](/blog/2016/02/rest-misconceptions-1)
1. [Not linked enough](/blog/2016/03/rest-misconceptions-2)
1. [Leaky business](/blog/2016/03/rest-misconceptions-3)
1. [Resources are application state](/blog/2016/03/rest-misconceptions-4)
1. **REST "documentation"**
1. Versioning

## Sum of all sins

I tend to think that most mistakes made when discussing REST boil down to the [misunderstanding of the identifier](/blog/2016/02/rest-misconceptions-1)
but also neglecting the other constraints. There are great tools out there like [API Blueprint][blueprint], [Swagger][swag] 
or [RAML][RAML], but they have a significant flaw in common - the are ***URI centric***. 

I admire how most tools take an approach complete with steps for design, testing and API security but in the end the client 
and server usually rely on URI hierarchies. 

![swagger petstore](http://presentations.t-code.pl/hateoas/img/swagger.png)

Here's a screenshot from sample Swagger [petstore API](http://petstore.swagger.io). It's nice that URI templates are used,
but that's where the good ends. This kind of API documentation encourages developers to code against rigid URL structures.
Also most of these tools don't promote th use of links, which means that at every step in the interaction with the server
clients must be aware of the entirety of the API and the documentation also gives little information on the next possible
state transfers.

## Web API déjà vu

A coffin to the most "REST documentation" tools that I have seen is the idea of generating client and server code. I've
recently looked at [AutoRest][autorest] to generate client code from Swagger. It's quite neat and works just fine. You
run the executable, pass in the Swagger URL and the program produces a whole lot of code, which indeed works perfect with
the API. But it has little ot nothing to do with REST.

Haven't we seen that before?

![wsdl in vs](/uploads/03/wsdl.png)

You guessed it: **WSDL**. The infamous [Web Services Description Language][wsdl], which in it's latest incarnation is 
about as old as the first mention of REST. And it's by no means the [first attempt][ws-history] at web services. Haven't
we just come full circle? :recycle:

![api evolution](/uploads/03/api-evolution.jpg)

[blueprint]: https://apiblueprint.org/ 
[RAML]: http://raml.org
[swag]: http://swagger.io
[autorest]: https://github.com/Azure/autorest
[wsdl]: https://www.w3.org/TR/wsdl
[ws-history]: http://www.informationweek.com/from-edi-to-xml-and-uddi-a-brief-history-of-web-services/d/d-id/1012008