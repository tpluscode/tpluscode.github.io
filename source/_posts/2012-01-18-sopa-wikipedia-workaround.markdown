---
layout: post
status: publish
published: true
title: SOPA Wikipedia workaround
date: !binary |-
  MjAxMi0wMS0xOCAxMDowNDoyOCAtMDUwMA==
categories:
- various
redirect_from:
- /2012/01/sopa-wikipedia-workaround/
comments: true
---

{% img center /uploads/2011/01/WP_SOPA_Splash_Full.jpg 565 489 'SOPA protest' %}

<!--more-->

Today the English Wikipedia will be unavailable in a protest against the [2012/01/sopa-wikipedia-workaround/](http://en.wikipedia.org/wiki/SOPA]).
Or will it?

On Chrome when you load any English Wikipedia article, the actual content flicker for a fraction of a second and then
gets hidden under the SOPA protest content. This means that wikipedia hasn't been disabled really and javascript is used
to hide it's content.

If your really need wikipedia, there are three ways:

1. Hit ESC before the black screen appears
1. [Disable Javascript in your browser](http://lmgtfy.com/?q=Disable+Javascript+in+browser)
1. After opening any wikipedia page copy the below text into you address bar and hit enter (works in Chrome)

``` js
javacript:$('#mw-sopaOverlay').remove();$('div').css('display', 'block');
```

In other browsers you would have to paste the above into the javascript console. To open it there is a different shortcut
in different browsers:

* Chrome: ctrl+shift+j
* IE: F12 and then click on console tab
* Firefox: ctrl+shift+k
* Opera: ctrl+shift+i and click on console tab

### DISCLAIMER

I do not encourage you to ignore the reason why wikipedia decided to do such a move. I merely present ways for you to
work with wikipedia shall you really need it.

As far as SOPA is concerned, I totally agree with wikipedia and I support their cause!
