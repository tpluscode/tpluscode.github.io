---
layout: post
published: true
title: Interesting JavaScript quirk when accessing object with index
date: 2016-05-15 20:20
categories:
- javacript
description: Single element array (of any depth) can be used to index an object and gives same result as indexing with the array element itself
keywords: javascript, quirks
comments: true
---

I've just discovered an interesting JavaScript quirk which I haven't seen before. It turns out that indexing an object with a single
element array has the exact same effect as indexing with that array's element.

<!--more-->

JavaScript just doesn't stop amazing developers. There are [many quirks][q] I've seen, known and exploited. I was so surprised to hav
found one that I've never seen before. It turns out that [accessing object as an associative array][arr] works not only with the actual
index but also when a **single element array** is used for index. 

See for yourself below:

<a class="jsbin-embed" href="http://jsbin.com/malopafuju/embed?js,console">JS Bin on jsbin.com</a>

Of course, the array with two elements returns `undefined` as expected.

What is even more insane, is that the array can be of any depth as long as it is a single element array within a single element array 
within a single element array etc. How weird is that?

<a class="jsbin-embed" href="http://jsbin.com/joyegufagu/embed?js,console">JS Bin on jsbin.com</a><script src="http://static.jsbin.com/js/embed.min.js?3.35.12"></script>

A superfluous google search didn't answer why this works like that. A comment with an explanation will be greatly appreciated :smile:.

[q]: http://developer.telerik.com/featured/seven-javascript-quirks-i-wish-id-known-about/
[arr]: http://www.quirksmode.org/js/associative.html
