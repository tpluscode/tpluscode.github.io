---
layout: post
status: publish
published: true
title: Inserting style tag dynamically with Prototype
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 191
wordpress_url: http://t-code.pl/?p=191
date: !binary |-
  MjAxMS0wOS0xNiAwMTo0NDoxNSAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0wOS0xNSAyMzo0NDoxNSAtMDQwMA==
categories:
- Uncategorized
tags:
- prototype
- javascript
- ie
comments:
- id: 9
  author: Flora
  author_email: logvynenko@gmail.com
  author_url: http://www.yahoo.com/
  date: !binary |-
    MjAxMS0xMS0xMSAwMTo0MTo0MCAtMDUwMA==
  date_gmt: !binary |-
    MjAxMS0xMS0xMSAwMDo0MTo0MCAtMDUwMA==
  content: It's sokopy how clever some ppl are. Thanks!
permalink: /:year/:month/:title/
---
<p><!--:pl--></p>
<div>
<p style="text-align: justify;">Recently I had created a small on-screen keyboard. I may present it on my blog some time later. For now I'd like to share my experience with IE behaving different than other bowsers (yet again).</p></p>
<p></div></p>
<p style="text-align: justify;">The on-screen keyboard is a javascript class, which when created adds itself to document's DOM. Doing that it also creates itself some styles. Those styles are also updated when keyboard's properties change.</p><br />
I'm using <a title="Prototype Javascript framework" href="http://www.prototypejs.org/" target="_blank">prototype</a> and my initial (simplified to the core idea) solution is listed below.</p>
<pre class="brush: javascript; gutter: true">recreateStyles = function() {<br />
    styleElement = $(Numpad.styleId);</p>
<p>    if (styleElement == null) {<br />
        $$(&#039;body&#039;)[0].insert(new Element(&#039;style&#039;, {<br />
            id: Numpad.styleId<br />
        }));<br />
    }</p>
<p>    styleText = &#039;some style text&#039;;</p>
<p>    Element.update(Numpad.styleId, styleText);<br />
}</pre></p>
<p style="text-align: justify;">The above works perfectly with *most* modern browser. These include Chrome, Firefox and IE9. Unfortunately a fairly modern browser, which is IE8 refuses to add this style tag to the document. Not to mention IE6 ;)</p></p>
<p style="text-align: justify;">Fortunately Uncle Google already had a solution.&nbsp;Stoyan Stefanov posted at his blog a solution for this problem and also a way to insert script tag dynamically. His post can be found here:&nbsp;<a title="Dynamic SCRIPT and STYLE elements in IE" href="http://www.phpied.com/dynamic-script-and-style-elements-in-ie/">http://www.phpied.com/dynamic-script-and-style-elements-in-ie/</a>.</p><br />
Below I extracted the important part, JS code:</p>
<pre class="brush: javascript; gutter: true">var ss1 = document.createElement(&#039;style&#039;);<br />
var def = &#039;some style text&#039;;<br />
ss1.setAttribute("type", "text/css");<br />
var hh1 = document.getElementsByTagName(&#039;head&#039;)[0];<br />
hh1.appendChild(ss1);<br />
if (ss1.styleSheet) {   // IE<br />
    ss1.styleSheet.cssText = def;<br />
} else {                // the world<br />
    var tt1 = document.createTextNode(def);<br />
    ss1.appendChild(tt1);<br />
}</pre></p>
<p style="text-align: justify;">The above works fine and I could have stayed with it and adjusted my code accordingly, but as I mentioned before, I'm using prototype so I made the above utilize it:</p></p>
<pre class="brush: javascript; gutter: true">Numpad.recreateStyleSheet = function () {<br />
    styleElement = $(Numpad.styleId);</p>
<p>    if (styleElement == null) {<br />
        styleElement = new Element(&#039;style&#039;, {<br />
            id: Numpad.styleId<br />
            });<br />
        $$(&#039;body&#039;)[0].insert(styleElement);<br />
    }</p>
<p>    styleText = &#039;some style text&#039;;</p>
<p>    $$(&#039;head&#039;)[0].insert(styleElement);<br />
    if (styleElement.styleSheet) {   // IE<br />
        styleElement.styleSheet.cssText = styleText;<br />
    } else {                // the world<br />
        styleElement.update(styleText);<br />
    }<br />
};</pre><br />
&nbsp;</p>
<p style="text-align: justify;">There! It's a working way for inserting style tag into HTML document's <head> (possibly anywhere), which works in IE8. I also tested it in recent versions of Opera and Chrome and Firefox 3.6.</p><br />
Enjoy!<!--:--></p>
