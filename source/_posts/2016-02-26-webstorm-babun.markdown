---
layout: post
published: true
title: Configure Webstorm to use Babun shell
date: 2016-02-26 21:00
categories:
- webstorm
description: Simple instructions on how to configure Babun shell inside Webstorm
comments: true
---

Instructions for setting up [Babun][Babun] (zsh) as Webstorm terminal. I've recently been shown Babun and having it replace
GitHub for Windows shell in Webstorm was the last piece of my happiness. The tricky part was to have it open in the 
current working copy and not the default home path.

<!--more-->

I found these instructions somewhere on the web but forgot where it was. It's not that simple and required some minor 
tweaks so here's how I have it set up.

**1** Go to Babun installation folder (for me it's `%USERPROFILE%\.babun`)

**2** Create a batch file. I called it `cygwin.bat`

**3** The batch script is

``` batch
@echo off
set currentdir=%cd:\=/%
@echo cd %currentdir% > "%USERPROFILE%\.babun\cygwin\home\%USERNAME%\.bashrc_cd"
call %USERPROFILE%\.babun\cygwin\bin\bash --login -i -ls
```

**4** Add the created script as terminal command in Webstorm settings (you cannot use `%USERPROFILE%` variable here)

    ![Webstorm settings](/uploads/2016/02/babun.png)

**5** Enjoy!

    ![Webstorm terminal](/uploads/2016/02/webstorm.png)

[Babun]: http://babun.github.io/