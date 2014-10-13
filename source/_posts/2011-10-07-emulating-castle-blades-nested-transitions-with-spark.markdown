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
<h1 style="text-align: justify;">Nested transitions</h1></p>
<p style="text-align: justify;">As described on <a href="http://hammett.castleproject.org/index.php/category/castle/monorail/">Hammet's post</a>, Castle Blade view engine extends Razor's syntax to allow nested transitions. Those in turn give Blade a great deal of flexibility. The given example being usage of the new FormHelper.</p></p>
<pre class="brush: rails; gutter: true">@Form.For(..., @=> builder {<br />
   builder.FormTemplate(@=> t {</p>
<div>
         @t.Label(): @t.Field()<br />
      </div><br />
   });</p>
<fieldset id="contactForm">
<p>   @builder.TemplateFor( m => m.Name )<br />
   @builder.TemplateFor( m => m.Email )</p>
<p>   </fieldset><br />
})</pre></p>
<p style="text-align: justify;">The above is indeed cool but the readability is not great in my opinion. In Spark the above could look like this:</p></p>
<pre class="brush: xml; gutter: true">
<form for="ViewData.Model"<br />
   url="UserController.Urls.Update.Post()"><br />
   <FormTemplate></p>
<div>
         ${t.Label()} ${t.Field()}<br />
      </div><br />
   </FormTemplate></p>
<fieldset id="contactForm">
      <Template for="Name" /><br />
      <Template for="Email" /><br />
   </fieldset><br />
</form></pre></p>
<p style="text-align: justify;">Unfortunately porting the syntax of nested transitions to Spark was not exactly easy. My initial solution was to use <a href="http://sparkviewengine.com/documentation/expressions#DeclaringMacros">macros</a>. I wrote about it on <a href="https://groups.google.com/forum/#!topic/spark-dev/-5yRXd2DPIQ">Spark's discussions group</a>. However this solution was far from perfect and following Robert's suggestions I changed the implementation to <a href="http://sparkviewengine.com/documentation/bindings">bindings</a> and helper methods.</p></p>
<h1 style="text-align: justify;">Nested tra... what?</h1></p>
<p style="text-align: justify;">Nested transition, or blocks are evaluated as inline lambdas. This means that the some of the XML tags will have to be evaluated as either a compatible method call or it's body.</p></p>
<p style="text-align: justify;">In the above example those custom tags are <Form>, <FormTemplate> and <Template>. They correspond to lines 1, 2, 10 and 11 in the Blade code fragment. The above example transforms into something like the following in C#:</p></p>
<pre class="brush: csharp; gutter: true">Form.For(<br />
   ViewData.Model,<br />
   UserController.Urls.Update.Post(),<br />
   builder =><br />
      {<br />
         builder.FormTemplate(<br />
            t =><br />
               new HtmlResult("rendered content"));</p>
<p>               // some output writing</p>
<p>               builder.TemplateFor(m => m.Name);<br />
               builder.TemplateFor(m => m.Email);</p>
<p>               // some output writing</p>
<p>               return new HtmlResult("rendered content");<br />
      }<br />
);</pre></p>
<p style="text-align: justify;">The most important parts are indeed the lambda expressions. The tricky part was transforming Spark's XML to te above-like form.</p></p>
<h1 style="text-align: justify;">Bindings to the rescue</h1><br />
For the mentioned transformations needed for this example to work I created 3 transformation. One for each method called (ie. Form.For, builder.FormTemplate and builder.TemplateFor):</p>
<pre class="brush: xml; gutter: true"><bindings><br />
  <element name="form"><br />
    <start># Form.For(@for, @url,<br />
    builder => new Castle.MonoRail.Helpers.HtmlResult(<br />
      formOutputWriter =>&nbsp;{<br />
      using(OutputScope(formOutputWriter)) {<br />
    </start><br />
    <end># }}));</end><br />
  </element></p>
<p>  <element name="Template"><br />
    builder.TemplateFor( model => model.@for )<br />
  </element></p>
<p>  <element name="FormTemplate"><br />
    <start># builder.FormTemplate(<br />
    t => new Castle.MonoRail.Helpers.HtmlResult(<br />
      formTemplateOutputWriter => {<br />
        using(OutputScope(formTemplateOutputWriter)) {<br />
    </start><br />
    <end># }}));</end><br />
  </element></pre></p>
<p style="text-align: justify;">Bindings transform a nonstandard tag defined by the name attribute into a given form and can take any number of parameters. It this example <Form> tag, if supplied for and url parameters transforms into a FormHelper#For call, it's content rendered as usually by Spark. <FormTemplate> tag being a simmilar case. Any <Template> tag transforms into a simple GenFormBuilder#TemplateFor call without body, but requires a 'for' parameter, which is the current model's property.</p></p>
<h1 style="text-align: justify;">Other uses</h1></p>
<p style="text-align: justify;">I would assume that those nested transitions will be heavily used in Blade and thus the above method could be used heavily when working with the new Monorail's lambda API.</p></p>
<p style="text-align: justify;">Because of that these and other bindings are stored in an embedded resource and I have created custom IBindingProvider decoratod class, which will combine them with any custom user bindings. This class can be found <a href="https://github.com/ploosqva/Castle.MonoRail3/blob/master/src/Castle.MonoRail.ViewEngines.Spark/Castle.Monorail.ViewEngines.Spark/Bindings/MR3BindingProvider.cs">here</a>.</p><br />
<!--:--></p>
