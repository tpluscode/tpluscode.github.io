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
permalink: /:year/:month/:title/
---
<p><!--:en--></p>
<p style="text-align: center;"><img class="aligncenter" title="SOPA protest" alt="" src="http://upload.wikimedia.org/wikipedia/commons/9/98/WP_SOPA_Splash_Full.jpg" width="565" height="489" /></p><br />
Today the English Wikipedia will be unavailable in a protest against the <a title="SOPA" href="http://en.wikipedia.org/wiki/SOPA">Stop Online Piracy Act</a>. Or will it?</p>
<p>On Chrome when you load any English Wikipedia article, the actual content flicker for a fraction of a second and then gets hidden under the SOPA protest content. This means that wikipedia hasn't been disabled really and javascript is used to hide it's content.</p>
<p>If your really need wikipedia, there are three ways:</p>
<ol>
<li>Hit ESC before the black screen appears</li>
<li><a href="http://lmgtfy.com/?q=Disable+Javascript+in+browser">Disable Javascript in your browser</a></li>
<li>After opening any wikipedia page copy the below text into you address bar and hit enter (works in Chrome).</li><br />
</ol></p>
<pre class="brush: javascript; gutter: false">javacript:$(&#039;#mw-sopaOverlay&#039;).remove();$(&#039;div&#039;).css(&#039;display&#039;, &#039;block&#039;);</pre><br />
In other browsers you would have to paste the above into the javascript console. To open it there is a different shortcut in different browsers:</p>
<ul>
<li>Chrome: ctrl+shift+j</li>
<li>IE: F12 and then click on console tab</li>
<li>Firefox: ctrl+shift+k</li>
<li>Opera: ctrl+shift+i and click on console tab</li><br />
</ul></p>
<h2><span style="font-size: small;"><span style="line-height: 24px;">DISCLAIMER</span></span></h2><br />
I do not encourage you to ignore the reason why wikipedia decided to do such a move. I merely present ways for you to work with wikipedia shall you really need it.</p>
<p>As far as SOPA is concerned, I totally agree with wikipedia and I support their cause!<!--:--></p>
