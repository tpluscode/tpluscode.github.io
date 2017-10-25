---
layout: post
published: true
title: Visual Studio must-have - Open Command Line (and Babun)
date: 2017-10-25 08:00
categories:
- visual studio
description: Configuring a very useful extension to work with Babun shell
keywords: visual studio, babun
comments: true
---

I've been using the [Open Command Line](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.OpenCommandLine)
by Mads Kristensen for several months now. Recently I've finally figured out how to have it open [Babun][Babun] and
decided to share.

<!--more-->

The extension is quite simple. It adds a menu item to folders in Solution Explorer and a shortcut which will open a new
terminal window. By default it's `Alt+Space`, which I haven't felt like changing.

Not only does it open that console, it will actually set the working directory based on the open file or selected item in
Solution Explorer, whichever is focused.

![open cmd](/images/open-cmd.png)

Default settings include Developer Command Prompt but most importantly it let's you set up a custom terminal to run.

## Setting up with Babun the right way

In the past I had already set up Open Command Line to open Babun but it opened an ugly cygwin window which I didn't like.
It made me use the extension sparingly. With proper setup however I use it all the time.

To set it up go to `Tools -> Optiona -> Command Line` and input these values

{% codeblock lang:yaml %}
Friendly Name:
  - Default (Custom)
Select preset:
  - Custom
Command:
  - %UserProfile%\.babun\cygwin\bin\mintty.exe
Command arguments:  
  - /bin/env CHERE_INVOKING=1 /bin/zsh.exe
{% endcodeblock %}

![open cmd](/images/open-cmd-babun.png)

Oh, and guess what. [Babun will become one of the default presets soon](https://github.com/madskristensen/OpenCommandLine/pull/60).

[Babun]: http://babun.github.io
