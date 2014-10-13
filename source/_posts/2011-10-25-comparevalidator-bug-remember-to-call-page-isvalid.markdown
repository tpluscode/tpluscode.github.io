---
layout: post
status: publish
published: true
title: ! 'CompareValidator bug: remember to call Page.IsValid?'
date: !binary |-
  MjAxMS0xMC0yNSAxMDowODowNiAtMDQwMA==
categories:
- .net
tags:
- web forms
- asp.net
redirect_from:
- /2011/10/comparevalidator-bug-remember-to-call-page-isvalid/
---

One of the common mistakes developers make when working with Web Forms pages is using client-side validation, while not 
checking the validation result on server-side postback.

This mistake is easily noticeable with CustomValidator as it only works on the server's side. Also when Javascript is 
disabled you would quickly run into trouble when trying to rely solely on client-side validation.

<!--more-->

Now, in other cases you should be fine right? Not really, no. I've just found a little bug in CompareValidator. Let's 
try this:

``` xml
<asp:CompareValidator Type="Date" Operator="DataTypeCheck"
   runat="server" ControlToValidate="SomeTB" Display="Dynamic">
   Message
</asp:CompareValidator>
```

And on the server side:

``` c#
protected void HandleEvent(object sender, EventArgs e)
{
   DateTime.Parse(SomeTB.Text);
}
```

There is an obvious problem. Page.IsValid is not checked to ensure the submitted form is valid. With built-in validators
and JS enabled this shouldn't be a problem.

However the ComapreValidator is a bit picky. It works fine for input like 2000-10-10, or 2000-00-00. Also writing for
example 20-10-10 validates correctly and parsing it would not be a problem.

Surprisingly though date 25-25-25, which is not valid causes the JS validation to fail inside ScripResource.axd with an
exception and postback is not stopped even though the form is not valid. So what happens then? Event handler throws an
exception where it tries to parse the input. For that reason always remember to write your handlers like

``` c#
protected void HandleEvent(object sender, EventArgs e)
{
   if(IsValid)
   {
      DateTime.Parse(SomeTB.Text);
   }
}
```
