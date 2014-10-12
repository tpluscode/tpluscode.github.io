---
layout: post
status: publish
published: true
title: Emulating Castle Blade's nested transitions with Spark
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 215
wordpress_url: http://t-code.pl/?p=215
date: !binary |-
  MjAxMS0xMC0wNyAxOTo0NDowNyAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0xMC0wNyAxNzo0NDowNyAtMDQwMA==
categories:
- Uncategorized
tags:
- .net
- monorail
- spark
- castle
- blade
comments: []
---
<p><!--:en--></p>
<h1 style="text-align: justify;">Nested transitions<&#47;h1></p>
<p style="text-align: justify;">As described on <a href="http:&#47;&#47;hammett.castleproject.org&#47;index.php&#47;category&#47;castle&#47;monorail&#47;">Hammet's post<&#47;a>, Castle Blade view engine extends Razor's syntax to allow nested transitions. Those in turn give Blade a great deal of flexibility. The given example being usage of the new FormHelper.<&#47;p></p>
<pre class="brush: rails; gutter: true">@Form.For(..., @=> builder {<br />
   builder.FormTemplate(@=> t {</p>
<div>
         @t.Label(): @t.Field()<br />
      <&#47;div><br />
   });</p>
<fieldset id="contactForm">
<p>   @builder.TemplateFor( m => m.Name )<br />
   @builder.TemplateFor( m => m.Email )</p>
<p>   <&#47;fieldset><br />
})<&#47;pre></p>
<p style="text-align: justify;">The above is indeed cool but the readability is not great in my opinion. In Spark the above could look like this:<&#47;p></p>
<pre class="brush: xml; gutter: true">
<form for="ViewData.Model"<br />
   url="UserController.Urls.Update.Post()"><br />
   <FormTemplate></p>
<div>
         ${t.Label()} ${t.Field()}<br />
      <&#47;div><br />
   <&#47;FormTemplate></p>
<fieldset id="contactForm">
      <Template for="Name" &#47;><br />
      <Template for="Email" &#47;><br />
   <&#47;fieldset><br />
<&#47;form><&#47;pre></p>
<p style="text-align: justify;">Unfortunately porting the syntax of nested transitions to Spark was not exactly easy. My initial solution was to use <a href="http:&#47;&#47;sparkviewengine.com&#47;documentation&#47;expressions#DeclaringMacros">macros<&#47;a>. I wrote about it on <a href="https:&#47;&#47;groups.google.com&#47;forum&#47;#!topic&#47;spark-dev&#47;-5yRXd2DPIQ">Spark's discussions group<&#47;a>. However this solution was far from perfect and following Robert's suggestions I changed the implementation to <a href="http:&#47;&#47;sparkviewengine.com&#47;documentation&#47;bindings">bindings<&#47;a> and helper methods.<&#47;p></p>
<h1 style="text-align: justify;">Nested tra... what?<&#47;h1></p>
<p style="text-align: justify;">Nested transition, or blocks are evaluated as inline lambdas. This means that the some of the XML tags will have to be evaluated as either a compatible method call or it's body.<&#47;p></p>
<p style="text-align: justify;">In the above example those custom tags are <Form>, <FormTemplate> and <Template>. They correspond to lines 1, 2, 10 and 11 in the Blade code fragment. The above example transforms into something like the following in C#:<&#47;p></p>
<pre class="brush: csharp; gutter: true">Form.For(<br />
   ViewData.Model,<br />
   UserController.Urls.Update.Post(),<br />
   builder =><br />
      {<br />
         builder.FormTemplate(<br />
            t =><br />
               new HtmlResult("rendered content"));</p>
<p>               &#47;&#47; some output writing</p>
<p>               builder.TemplateFor(m => m.Name);<br />
               builder.TemplateFor(m => m.Email);</p>
<p>               &#47;&#47; some output writing</p>
<p>               return new HtmlResult("rendered content");<br />
      }<br />
);<&#47;pre></p>
<p style="text-align: justify;">The most important parts are indeed the lambda expressions. The tricky part was transforming Spark's XML to te above-like form.<&#47;p></p>
<h1 style="text-align: justify;">Bindings to the rescue<&#47;h1><br />
For the mentioned transformations needed for this example to work I created 3 transformation. One for each method called (ie. Form.For, builder.FormTemplate and builder.TemplateFor):</p>
<pre class="brush: xml; gutter: true"><bindings><br />
  <element name="form"><br />
    <start># Form.For(@for, @url,<br />
    builder => new Castle.MonoRail.Helpers.HtmlResult(<br />
      formOutputWriter =>&nbsp;{<br />
      using(OutputScope(formOutputWriter)) {<br />
    <&#47;start><br />
    <end># }}));<&#47;end><br />
  <&#47;element></p>
<p>  <element name="Template"><br />
    builder.TemplateFor( model => model.@for )<br />
  <&#47;element></p>
<p>  <element name="FormTemplate"><br />
    <start># builder.FormTemplate(<br />
    t => new Castle.MonoRail.Helpers.HtmlResult(<br />
      formTemplateOutputWriter => {<br />
        using(OutputScope(formTemplateOutputWriter)) {<br />
    <&#47;start><br />
    <end># }}));<&#47;end><br />
  <&#47;element><&#47;pre></p>
<p style="text-align: justify;">Bindings transform a nonstandard tag defined by the name attribute into a given form and can take any number of parameters. It this example <Form> tag, if supplied for and url parameters transforms into a FormHelper#For call, it's content rendered as usually by Spark. <FormTemplate> tag being a simmilar case. Any <Template> tag transforms into a simple GenFormBuilder#TemplateFor call without body, but requires a 'for' parameter, which is the current model's property.<&#47;p></p>
<h1 style="text-align: justify;">Other uses<&#47;h1></p>
<p style="text-align: justify;">I would assume that those nested transitions will be heavily used in Blade and thus the above method could be used heavily when working with the new Monorail's lambda API.<&#47;p></p>
<p style="text-align: justify;">Because of that these and other bindings are stored in an embedded resource and I have created custom IBindingProvider decoratod class, which will combine them with any custom user bindings. This class can be found <a href="https:&#47;&#47;github.com&#47;ploosqva&#47;Castle.MonoRail3&#47;blob&#47;master&#47;src&#47;Castle.MonoRail.ViewEngines.Spark&#47;Castle.Monorail.ViewEngines.Spark&#47;Bindings&#47;MR3BindingProvider.cs">here<&#47;a>.<&#47;p><br />
<!--:--></p>
