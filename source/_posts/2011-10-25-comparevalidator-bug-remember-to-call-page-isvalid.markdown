---
layout: post
status: publish
published: true
title: ! 'CompareValidator bug: remember to call Page.IsValid?'
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 228
wordpress_url: http://t-code.pl/?p=228
date: !binary |-
  MjAxMS0xMC0yNSAxMDowODowNiAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0xMC0yNSAwODowODowNiAtMDQwMA==
categories:
- Uncategorized
tags:
- web forms
- asp.net
comments: []
---
<p><!--:en-->On of the common mistakes developers make when working with Web Forms pages is using client-side validation, while not checking the validation result on server-side postback.</p>
<p>This mistake is easily noticeable with CustomValidator as it only works on the server's side. Also when Javascript is disabled you would quickly run into trouble when trying to rely solely on client-side validation.</p>
<p>Now, in other cases you should be fine right? Not really, no. I've just found a little bug in CompareValidator. Let's try this:</p>
<pre class="brush: xml; gutter: true"><asp:CompareValidator Type="Date" Operator="DataTypeCheck"<br />
   runat="server" ControlToValidate="SomeTB" Display="Dynamic"><br />
   Message<br />
</asp:CompareValidator></pre><br />
And on the server side:</p>
<pre class="brush: csharp; gutter: true">protected void HandleEvent(object sender, EventArgs e)<br />
{<br />
   DateTime.Parse(SomeTB.Text);<br />
}</pre><br />
There is an obvious problem. Page.IsValid is not checked to ensure the submitted form is valid. With built-in validators and JS enabled this shouldn't be a problem.</p>
<p>However the ComapreValidator is a bit picky. It works fine for input like 2000-10-10, or 2000-00-00. Also writing for example 20-10-10 validates correctly and parsing it would not be a problem.</p>
<p>Surprisingly though date 25-25-25, which is not valid causes the JS validation to fail inside ScripResource.axd with an exception and postback is not stopped even though the form is not valid. So what happens then? Event handler throws an exception where it tries to parse the input. For that reason always remember to write your handlers like</p>
<pre class="brush: csharp; gutter: true">protected void HandleEvent(object sender, EventArgs e)<br />
{<br />
   if(!IsValid)<br />
      return;</p>
<p>   DateTime.Parse(SomeTB.Text);<br />
}</pre><br />
or</p>
<pre class="brush: csharp; gutter: true">protected void HandleEvent(object sender, EventArgs e)<br />
{<br />
   if(IsValid)<br />
   {<br />
      DateTime.Parse(SomeTB.Text);<br />
   }<br />
}</pre><br />
<!--:--></p>
