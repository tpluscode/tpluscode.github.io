---
layout: post
status: publish
published: true
title: No disk space, hidden Virtuozzo, crouching MSSQL
date: !binary |-
  MjAxMS0wNy0wMiAxNDo0NDo1MyAtMDQwMA==
categories:
- Semantic Web
tags:
- plesk
- virtuozzo
- mssql
- iis
redirect_from:
- /2011/07/hidden-virtuozzo-crouching-mssql/
---

Sometimes the real reason for some events may be very obscure.

Just minutes ago my VPS experienced an unexpected problem: no disk space. Not at all. Not a single byte! And naturally
I found out only by chance.

## Cannot start application pool
I logged on to my VPS and as usually, Server Manager opens. What caught my attention were

> Events: 16 errors, 9 informational in the last 24 hours

<!--more-->

Some of them similar to the below:

> A process serving application pool ‚PleskControlPanel’ reported a failure trying to read configuration during startup.
> The process id was ’85448′. Please check the Application Event Log for further event messages logged by the worker
> process on the specific error.
>
> The data field contains the error number.

WTF? I immediately went to Application pools in IIS to try starting the failed pools and I got an error message dialog:

{% img center http://t-code.pl/wp-content/uploads/2011/07/cannotwriteconfiguration.gif 404 230 %}

Almost like the dialog above, except the "<em>due to insufficient permissions</em><span>" part. It simply said that
config file could not be written to. I assumed permission problems though but it quickly turned out not to be the issue.

To diagnose the problem I downloaded [JAM Software TreeSize Free ](http://www.jam-software.com/treesize_free/) to find
out where has my space gone.

## Hidden Virtuozzo

Scanning with TreeSize didn't help at first. It showed some 15 GB in Windows dir, and some more gigabytes in other
folders. Nothing out of the ordinary, except one thing.

{% img center http://t-code.pl/wp-content/uploads/2011/07/vzquota-folder.gif 275 27 %}

Quick google revealed it's a folder used by Parallels, but it cannot be accessed from within a container. Unfortunately
googling for vzquota and disk space related problems proved fruitless. Still baffled I looked in Plesk's and Virtuozzo's
every corner but found nothing.

## Crouching MSSQL

Almost resigned I decided to try the oldest solution of all - system reboot. After system has started I ran TreeSize
again and here's what I saw:

{% img center http://t-code.pl/wp-content/uploads/2011/07/mssql-huge-error-log.gif 387 141 %}

Pretty cool huh? :) MS SQL had kept the file locked, so it didn't show up when I'd scanned the drive for the first time.

I never actually found out what the problem was. Not that it matters anymore. I've learned though what everyone probably
knows subconsciously. Real reasons often remain hidden from our view...

Quite philosophical that :)
