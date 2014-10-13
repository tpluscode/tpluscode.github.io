---
layout: post
status: publish
published: true
title: Spark View Engine for Monorail3
date: !binary |-
  MjAxMS0xMC0wNyAxOTo0MzoxMSAtMDQwMA==
categories:
- .net
tags:
- .net
- monorail
- spark
- razor
- castle
- blade
redirect_from:
- /2011/10/emulating-castle-blades-nested-transitions-with-spark/
---

[Hamilton Verissimo](http://hammett.castleproject.org) currently develops a next version of Monorail, which uses a new
view engine called Blade. As much as I'd love to use Monorail 3 in the (near) future, Spark is bound to stay my view
engine of choice.

<!--more-->

Unfortunately Monorail 3 is a complete rewrite in F# and the current Spark won't work out of the box and a new library
is needed. Thus I forked the [Monorail3 git repository](https://github.com/castleproject/Castle.MonoRail) (you can find
it at [https://github.com/ploosqva/Castle.MonoRail3](https://github.com/ploosqva/Castle.MonoRail3), where I will slowly
implement features found in the current Spark for Monorail 2.x.

I will post some notes on the progress on this blog. Below is the list of current posts on that subject:

1. [Castle Blade's nested transitions with Spark](/2011/10/emulating-castle-blades-nested-transitions-with-spark/)
