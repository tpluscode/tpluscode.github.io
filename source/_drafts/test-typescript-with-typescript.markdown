---
layout: post
published: true
title: Fight TypeScript with TypeScript
date: 2016-04-10 22:45
categories:
- dajsiepoznac
- typescript
- unit tests
description: My recipe for testing code written in TypeScript with more TypeScript, karma, jasmine and sinon
comments: true
---

Given that I'm fairly satisfied with the state of my server-side [Hydra][Hydra] library for [NancyFx][NancyFx] called
**Argolis** it is now time to write some client-side library to consume it. I did some spiking in another small project
and it was now time to do it properly. I've already had some experience with TypeScript and JSPM so I decided to give
these two a go

Unfortunately getting the project setup right was harder than I'd hoped. Here's how I managed to get my first test to pass.

<!--more-->

## Test first

I want to proceed with a TDD approach but unlike before this time I want to write both my code and modules in TypeScript.

![fight fire with fire](/uploads/2016/04/FightFireWith_Fire.png)



[Hydra]: http://hydra-cg.org
[NancyFx]: http://github.com/nancyfx/nancy 