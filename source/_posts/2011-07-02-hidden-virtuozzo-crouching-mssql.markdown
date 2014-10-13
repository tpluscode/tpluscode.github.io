---
layout: post
status: publish
published: true
title: No disk space, hidden Virtuozzo, crouching MSSQL
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 122
wordpress_url: http://t-code.pl/?p=122
date: !binary |-
  MjAxMS0wNy0wMiAxNDo0NDo1MyAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0wNy0wMiAxMjo0NDo1MyAtMDQwMA==
categories:
- Uncategorized
tags:
- plesk
- virtuozzo
- mssql
- iis
comments:
- id: 8
  author: Hessy
  author_email: villaorleanspr@gmail.com
  author_url: http://www.google.com/
  date: !binary |-
    MjAxMS0xMS0xMSAwMDo0NDozMiAtMDUwMA==
  date_gmt: !binary |-
    MjAxMS0xMS0xMCAyMzo0NDozMiAtMDUwMA==
  content: Real brain power on display. Thanks for that aswner!
---
<p><!--:pl--></p>
<div>
<p style="text-align: justify;">Sometimes the real reason for some events may be very obscure.</p></p>
<p></div></p>
<p style="text-align: justify;">Just minutes ago my VPS experienced an unexpected problem: no disk space. Not at all. Not a single byte! And naturally I found out only by chance.</p></p>
<h1 style="text-align: justify;">Cannot start application pool</h1></p>
<p style="text-align: justify;">I logged on to my VPS and as usually, Server Manager opens. What caught my attention were</p></p>
<p style="text-align: justify;"><em><span>Events: 16 errors, 9 informational in the last 24 hours</span></em></p></p>
<p style="text-align: justify;">Some of them similar to the below:</p></p>
<p style="text-align: justify;"><em><span>A process serving application pool 'PleskControlPanel' reported a failure trying to read configuration during <span>startup</span>. The process id was '85448'. &nbsp;Please check the Application Event Log for further event messages logged by the worker process on the specific error. &nbsp;The data field contains the error number.</span></em></p></p>
<p style="text-align: justify;">WTF? I immediately went to Application pools in IIS to try starting the failed pools and I got an error message dialog:</p></p>
<p style="text-align: justify;"><a href="http://t-code.pl/wp-content/uploads/2011/07/cannotwriteconfiguration.gif"><img class="aligncenter size-full wp-image-124" title="Cannot write configuration file" alt="" src="http://t-code.pl/wp-content/uploads/2011/07/cannotwriteconfiguration.gif" width="404" height="230" /></a></p></p>
<p style="text-align: justify;">Almost like the dialog above, except the "<em>due to insufficient permissions</em><span>" part. It simply said that <span>config</span> file could not be written to. I assumed permission problems though but it quickly turned out not to be the issue.</span></p></p>
<p style="text-align: justify;">To diagnose the problem I downloaded <a title="TreeSize Free" href="http://www.jam-software.com/treesize_free/" target="_blank"><span>JAM Software <span>TreeSize</span> Free</span></a> to find out where has my space gone.</p></p>
<h1 style="text-align: justify;"><span>Hidden <span>Virtuozzo</span></span></h1></p>
<p style="text-align: justify;"><span>Scanning wi<span>th</span> <span>TreeSize</span> didn't help at first. It showed some 15 GB in Windows <span>dir</span>, and some more gigabytes in other folders. Nothing out of the ordinary, except one thing.</span></p></p>
<p style="text-align: justify;"><img class="aligncenter size-full wp-image-126" title="Vzquota folder - access denied" alt="" src="http://t-code.pl/wp-content/uploads/2011/07/vzquota-folder.gif" width="275" height="27" /><span>Quick google revealed it's a folder used by Parallels, but it cannot be accessed from within a container. Unfortunately googling for <span>vzquota</span> and disk space related problems proved fruitless. Still baffled I looked in <span>Plesk's</span> and <span>Virtuozzo's</span> every corner but found nothing.</span></p></p>
<h1 style="text-align: justify;">Crouching MSSQL</h1></p>
<p style="text-align: justify;"><span>Almost resigned I decided to try the oldest solution of all - system reboot. After system has started I ran <span>TreeSize</span> again and here's what I saw:</span></p></p>
<p style="text-align: justify;"><img class="aligncenter size-full wp-image-127" title="mssql huge error log file" alt="" src="http://t-code.pl/wp-content/uploads/2011/07/mssql-huge-error-log.gif" width="387" height="141" />Pretty cool huh? :) MS SQL had kept the file locked, so it didn't show up when I'd scanned the drive for the first time.</p></p>
<p style="text-align: justify;">I never actually found out what the problem was. Not that it matters anymore. I've learned though what everyone probably knows subconsciously. Real reasons often remain hidden from our view...</p></p>
<p style="text-align: justify;">Quite philosophical&nbsp;that :)</p><br />
<!--:--></p>
