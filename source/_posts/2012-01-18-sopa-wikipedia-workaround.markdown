---
layout: post
status: publish
published: true
title: SOPA Wikipedia workaround
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 268
wordpress_url: http://t-code.pl/?p=268
date: !binary |-
  MjAxMi0wMS0xOCAxMDowNDoyOCAtMDUwMA==
date_gmt: !binary |-
  MjAxMi0wMS0xOCAwOTowNDoyOCAtMDUwMA==
categories:
- Uncategorized
tags: []
comments: []
---
<p><!--:en--></p>
<p style="text-align: center;"><img class="aligncenter" title="SOPA protest" alt="" src="http:&#47;&#47;upload.wikimedia.org&#47;wikipedia&#47;commons&#47;9&#47;98&#47;WP_SOPA_Splash_Full.jpg" width="565" height="489" &#47;><&#47;p><br />
Today the English Wikipedia will be unavailable in a protest against the <a title="SOPA" href="http:&#47;&#47;en.wikipedia.org&#47;wiki&#47;SOPA">Stop Online Piracy Act<&#47;a>. Or will it?</p>
<p>On Chrome when you load any English Wikipedia article, the actual content flicker for a fraction of a second and then gets hidden under the SOPA protest content. This means that wikipedia hasn't been disabled really and javascript is used to hide it's content.</p>
<p>If your really need wikipedia, there are three ways:</p>
<ol>
<li>Hit ESC before the black screen appears<&#47;li>
<li><a href="http:&#47;&#47;lmgtfy.com&#47;?q=Disable+Javascript+in+browser">Disable Javascript in your browser<&#47;a><&#47;li>
<li>After opening any wikipedia page copy the below text into you address bar and hit enter (works in Chrome).<&#47;li><br />
<&#47;ol></p>
<pre class="brush: javascript; gutter: false">javacript:$(&#039;#mw-sopaOverlay&#039;).remove();$(&#039;div&#039;).css(&#039;display&#039;, &#039;block&#039;);<&#47;pre><br />
In other browsers you would have to paste the above into the javascript console. To open it there is a different shortcut in different browsers:</p>
<ul>
<li>Chrome: ctrl+shift+j<&#47;li>
<li>IE: F12 and then click on console tab<&#47;li>
<li>Firefox: ctrl+shift+k<&#47;li>
<li>Opera: ctrl+shift+i and click on console tab<&#47;li><br />
<&#47;ul></p>
<h2><span style="font-size: small;"><span style="line-height: 24px;">DISCLAIMER<&#47;span><&#47;span><&#47;h2><br />
I do not encourage you to ignore the reason why wikipedia decided to do such a move. I merely present ways for you to work with wikipedia shall you really need it.</p>
<p>As far as SOPA is concerned, I totally agree with wikipedia and I support their cause!<!--:--></p>
