---
layout: post
status: publish
published: true
title: Emulating Castle Blade's nested transitions with Spark
date: !binary |-
  MjAxMS0xMC0wNyAxOTo0NDowNyAtMDQwMA==
categories:
- .net
- castle monorail
- spark
- blade
redirect_from:
- /2011/10/emulating-castle-blades-nested-transitions-with-spark/
---

## Nested transitions

As described on [Hammet's post](http://hammett.castleproject.org/index.php/category/castle/monorail/), Castle Blade view 
engine extends Razor's syntax to allow nested transitions. Those in turn give Blade a great deal of flexibility. The 
given example being usage of the new FormHelper.

<!--more-->

``` ruby
@Form.For(..., @=> builder {
   builder.FormTemplate(@=> t {
      <div>
         @t.Label(): @t.Field()
      </div>
   });

    <fieldset id="contactForm">

    @builder.TemplateFor( m => m.Name )
       @builder.TemplateFor( m => m.Email )
    </fieldset>
})
```

The above is indeed cool but the readability is not great in my opinion. In Spark the above could look like this:

``` xml
<form for="ViewData.Model"
      url="UserController.Urls.Update.Post()">
    <FormTemplate>
        <div>
            ${t.Label()} ${t.Field()}
        </div>
    </FormTemplate>

    <fieldset id="contactForm">
        <Template for="Name" />
        <Template for="Email" />
   </fieldset>
</form>
```

Unfortunately porting the syntax of nested transitions to Spark was not exactly easy. My initial solution was to use
[macros][spark-macro]macros. I wrote about it on [Spark's discussions group][group]. However this solution was far from
perfect and following Robert's suggestions I changed the implementation to [bindings[]bindings] and helper methods.

## Nested tra... what?

Nested transition, or blocks are evaluated as inline lambdas. This means that the some of the XML tags will have to be
evaluated as either a compatible method call or it's body.

In the above example those custom tags are `<Form>`, `<FormTemplate>` and `<Template>`. They correspond to lines 1, 2,
10 and 11 in the Blade code fragment. The above example transforms into something like the following in C#:

``` c#
Form.For(
   ViewData.Model,
   UserController.Urls.Update.Post(),
   builder =>
      {
         builder.FormTemplate(
            t =>
               new HtmlResult("rendered content"));

               // some output writing
               builder.TemplateFor(m => m.Name);
               builder.TemplateFor(m => m.Email);

               // some output writing
               return new HtmlResult("rendered content");
      }
);
```

The most important parts are indeed the lambda expressions. The tricky part was transforming Spark's XML to te above-like
form.

## Bindings to the rescue

For the mentioned transformations needed for this example to work I created 3 transformation. One for each method called \
(ie. `Form.For`, `builder.FormTemplate` and `builder.TemplateFor`):

``` xml
<bindings>
  <element name="form">
    <start># Form.For(@for, @url,
    builder => new Castle.MonoRail.Helpers.HtmlResult(
      formOutputWriter => {
      using(OutputScope(formOutputWriter)) {
    </start>
    <end># }}));</end>
  </element>

  <element name="Template">
    builder.TemplateFor( model => model.@for )
  </element>

  <element name="FormTemplate">
    <start># builder.FormTemplate(
    t => new Castle.MonoRail.Helpers.HtmlResult(
      formTemplateOutputWriter => {
        using(OutputScope(formTemplateOutputWriter)) {
    </start>
    <end># }}));</end>
  </element>
</bindings>
```

Bindings transform a nonstandard tag defined by the name attribute into a given form and can take any number of
parameters. It this example `<Form>` tag, if supplied for and url parameters transforms into a FormHelper#For call, it's
content rendered as usually by Spark. <FormTemplate> tag being a simmilar case. Any <Template> tag transforms into a
simple GenFormBuilder#TemplateFor call without body, but requires a 'for' parameter, which is the current model's property.

## Other uses

I would assume that those nested transitions will be heavily used in Blade and thus the above method could be used
heavily when working with the new Monorail's lambda API.

Because of that these and other bindings are stored in an embedded resource and I have created custom IBindingProvider
decorated class, which will combine them with any custom user bindings. This class can be found
[here](https://github.com/ploosqva/Castle.MonoRail3/blob/master/src/Castle.MonoRail.ViewEngines.Spark/Castle.Monorail.ViewEngines.Spark/Bindings/MR3BindingProvider.cs).

[spark-macro]: http://sparkviewengine.com/documentation/expressions#DeclaringMacros
[group]: https://groups.google.com/forum/#!topic/spark-dev/-5yRXd2DPIQ
[bindings]: http://sparkviewengine.com/documentation/bindings