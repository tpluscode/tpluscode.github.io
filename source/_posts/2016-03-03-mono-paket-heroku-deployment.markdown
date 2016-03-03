---
layout: post
published: true
title: Deploying .NET app to Heroku is not fun &#35;dajsiepoznac
date: 2016-03-03 20:50
categories:
- dajsiepoznac
- mono
- heroku
- paket
description: I wanted to give Heroku a try and it's a PITA. Here's a workaround I'm going to try
comments: true
---

I've been building my wikibus.org code on AppVeyor, which is quite neat and used it to publish over WebDeploy to my VPS.
Having recently watched a convincing presentation about Heroku on [Wrocław .NET User Group][wrocnet] I decided that maybe
it will be an interesting experience.

<!--more-->

## First let's find a mono buildpack

For those who don't know [Heroku][heroku], it's a cloud hosting platform with support for anything really. It works by
creating Ubuntu a deployment image called a *[dyno][dyno]*, which can be bootstrapped with any technology stack. The bootstrapping
is done by setting up the process with a *[buildpack][buildpack]*. There are a [number of buildpacks][default-buildpacks] 
available for a number of languages out of the box: Java, node.js, Python, Ruby, etc. 

Unfortunately, for obvious reasons, there isn't an official package for .NET or mono. An exception is a new [ASP.NET 5][net5-buildpack].
There are however quite a few [buildpacks][bp1] [for][bp2] [.NET][bp3]. This didn't come as a surprise. After all the 
online community proves very resourceful :construction_worker:.

There is however comes another catch - I use Paket :sparkles: instead of NuGet Package Manager. I figured, meh, I'll just
fork a buildpack - preferably a one with recent mono, like version 4+ and just customize it to use Paket instead. So I 
went with [a buildpack by Adam Burgess][bp1] and adjusted the bash script...

## Mono isn't as ready as I'd hoped for :unamused:

And it doesn't work. It seems that mono 4.2, or whatever version the buildpack currently uses has some issues with ssl
certificates. I tried various remedies and I kept getting weird errors whenever Paket tried to do some network activity
over https.

So I though, okay maybe I can try another buildpack, which uses an older version of mono. There is actually 
[one already set up with Paket][bp-paket]. I did some tweaks, so that it plays nicer with my repository, and now the solution
won't build! :rage:

LibGit2Sharp native libraries don't work on mono:

> Error executing task Zoltu.Versioning.GitTask: An exception was thrown by the type initializer for LibGit2Sharp.Core.NativeMethods

This one is [Resourcer.Fody][fody] misbehaving:

> Fody: Could not find a resource.
    
And I also had issues with referencing assemblies. Enough of that.

## How about I deploy a pre-built package?

Who said I had to build the entire solution on Heroku? I already use AppVeyor to build an run test, so maybe I could just 
package all projects as nupkgs and deploy just a simple OWIN self-hosted application?
s
Stay tuned, I'll come back when that's ready :wink:

[wrocnet]: http://wrocnet.github.io
[heroku]: http://heroku.com
[net5-buildpack]: https://elements.heroku.com/buildpacks/heroku/dotnet-buildpack
[default-buildpacks]: https://devcenter.heroku.com/articles/buildpacks#officially-supported-buildpacks
[dyno]: https://devcenter.heroku.com/articles/dyno-types
[buildpack]: https://devcenter.heroku.com/articles/buildpacks
[bp1]: https://github.com/AdamBurgess/heroku-buildpack-mono
[bp2]: https://github.com/brandur/heroku-buildpack-mono
[bp3]: https://github.com/friism/heroku-buildpack-mono
[bp-paket]: https://github.com/robocat/mono-paket-buildpack
[fody]: https://github.com/Fody/Resourcer