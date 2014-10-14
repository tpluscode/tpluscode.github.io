---
layout: post
status: publish
published: true
title: Inserting style tag dynamically with Prototype
date: !binary |-
  MjAxMS0wOS0xNiAwMTo0NDoxNSAtMDQwMA==
categories:
- javascript
- prototype
redirect_from:
- /2011/09/inserting-style-tag-dynamically/
---

Recently I created a small on-screen keyboard. I may present it on my blog some time later. For now I'd like to share my
experience with IE behaving different than other browsers (yet again).

The on-screen keyboard is a javascript class, which when created adds itself to document's DOM. Doing that it also
creates itself some styles. Those styles are also updated when keyboard's properties change.

<!--more-->

I'm using [prototype](http://www.prototypejs.org/) and my initial (simplified to the core idea) solution is listed below.

``` js
recreateStyles = function() {
    styleElement = $(Numpad.styleId);

    if (styleElement == null) {
        $$('body')[0].insert(new Element('style', {
            id: Numpad.styleId
        }));
    }
    styleText = 'some style text';
    Element.update(Numpad.styleId, styleText);
}
```

The above works perfectly with *most* modern browser. These include Chrome, Firefox and IE9. Unfortunately a fairly
modern browser, which is IE8 refuses to add this style tag to the document. Not to mention IE6 ;)

Fortunately Uncle Google already had a solution. Stoyan Stefanov posted at his blog a solution for this problem and also 
a way to insert script tag dynamically. His post can be found here: [http://www.phpied.com/dynamic-script-and-style-elements-in-ie/](http://www.phpied.com/dynamic-script-and-style-elements-in-ie/)

Below I extracted the important part, JS code:
``` js
var ss1 = document.createElement('style');
var def = 'some style text';
ss1.setAttribute("type", "text/css");
var hh1 = document.getElementsByTagName('head')[0];
hh1.appendChild(ss1);
if (ss1.styleSheet) {   // IE
    ss1.styleSheet.cssText = def;
} else {                // the world
    var tt1 = document.createTextNode(def);
    ss1.appendChild(tt1);
}
```

The above works fine and I could have stayed with it and adjusted my code accordingly, but as I mentioned before,
I'm using prototype so I made the above utilize it:

``` js
Numpad.recreateStyleSheet = function () {
    styleElement = $(Numpad.styleId);

    if (styleElement == null) {
        styleElement = new Element('style', {
            id: Numpad.styleId
            });
        $$('body')[0].insert(styleElement);
    }

    styleText = 'some style text';</p>

    $$('head')[0].insert(styleElement);
    if (styleElement.styleSheet) {   // IE
        styleElement.styleSheet.cssText = styleText;
    } else {                // the world
        styleElement.update(styleText);
    }
};
```

There! It's a working way for inserting style tag into HTML document's `<head>` (possibly anywhere), which works in IE8.
I also tested it in recent versions of Opera and Chrome and Firefox 3.6.
