---
layout: post
status: publish
published: true
title: Disable "Missing XML documentation" warnings for WCF RIA Services
date: !binary |-
  MjAxMi0wNS0wOSAxMTozODoyNCAtMDQwMA==
categories:
- .net
tags:
- .net
- silverlight
- visual studio
- ria
redirect_from:
- /2012/05/disable-missing-xml-documentation-warnings-for-wcf-ria-services/
comments: true
---

Every project should be well documented and Visual Studio has the option to enforce XML code documentation by generating
warnings when there is a comment missing, a parameter description missing and such. It can be enabled per project by
enabling XML documentation file option on the Build tab.

There are however cases, when it is not necessary for XML docs to be present.

<!--more-->

If so, C# has the #pragma keyword. In a single file you can use it as shown below:

``` c#
#pragma warning disable 1591
  // only ignore warning CS1591

#pragma warning restore 1591
  // all warnings restorer

#pragma warning disable
  // no warnings here

#pragma warning restore
  // warnings will be shown here

#pragma warning disable
  // no warnings until end of file
```

But what if the warning comes from a generated file? #pragma is not an option because the file is likely to be
overwritten in the future (next build?). [Quoc Lam has posted about this on his blog][disable_xml]. His method is working
for auto-generated XAML files but what I needed was disabling warnings in files created by [RIA Services][ria].
Simmilarily to Quam's method it is possible to add an MSBuild target to the project in question, which add
`#pragma warning disable` line at the beginning of RIA generated files:

``` xml
<Target Name="CreateRiaClientFilesTaskDisableWarnings" AfterTargets="CreateRiaClientFiles">
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do echo #pragma warning disable > %%f.temp" />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do type %%f >> %%f.temp" />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do attrib -r %%f" />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do move /y %%f.temp %%f" />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do attrib +r %%f" />
  <Message Text="CreateRiaClientFilesTaskDisableWarnings: @(RiaClientGeneratedFiles)" />
</Target>
```

For some reason RIA creates those files read-only, hence usage of the attrib tool

Voila, no RIA-related warnings any more coming from the generated files.

[disable_xml]: http://lvquoc.blogspot.com/2010/11/disable-xml-comment-warning-in-workflow.html
[ria]: http://www.silverlight.net/learn/advanced-techniques/wcf-ria-services/get-started-with-wcf-ria-services