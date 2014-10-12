---
layout: post
status: publish
published: true
title: Disable "Missing XML documentation" warnings for WCF RIA Services<
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 273
wordpress_url: http://t-code.pl/?p=273
date: !binary |-
  MjAxMi0wNS0wOSAxMTozODoyNCAtMDQwMA==
date_gmt: !binary |-
  MjAxMi0wNS0wOSAwOTozODoyNCAtMDQwMA==
categories:
- Uncategorized
tags:
- .net
- silverlight
- visual studio
- ria
comments: []
---
<p><!--:en-->Every project should be well documented and Visual Studio has the option to enforce XML code documentation by generating warnings when there is a comment missing, a parameter description missing and such. It can be enabled per project by enabling XML documentation file option on the Build tab.</p>
<p>There are however cases, when it is not necessary for XML docs to be present. If so, C# has the #pragma keyword. In a single file you can use it as shown below:</p>
<pre class="brush: csharp; gutter: true">#pragma warning disable 1591</p>
<p>  &#47;&#47; only ignore warning CS1591</p>
<p>#pragma warning restore 1591</p>
<p>  &#47;&#47; all warnings restorer</p>
<p>#pragma warning disable</p>
<p>  &#47;&#47; no warnings here</p>
<p>#pragma warning restore</p>
<p>  &#47;&#47; warnings will be shown here</p>
<p>#pragma warning disable</p>
<p>  &#47;&#47; no warnings until end of file<&#47;pre><br />
But what if the warning comes from a generated file? #pragma is not an option because the file is likely to be overwritten in the future (next build?).&nbsp;<a title="Disabling XML comment warnings for XAML files" href="http:&#47;&#47;lvquoc.blogspot.com&#47;2010&#47;11&#47;disable-xml-comment-warning-in-workflow.html">Quoc Lam has posted about this on his blog<&#47;a>. His method is working for auto-generated XAML files but what I needed was disabling warnings in files created by <a title="RIA Services" href="http:&#47;&#47;www.silverlight.net&#47;learn&#47;advanced-techniques&#47;wcf-ria-services&#47;get-started-with-wcf-ria-services">RIA Services<&#47;a>. Simmilarily to Quam's method it is possible to add an MSBuild target to the project in question, which add "#pragma warning disable" lin at the beginning of RIA generated files:</p>
<pre class="brush: xml; gutter: true"><Target Name="CreateRiaClientFilesTaskDisableWarnings" AfterTargets="CreateRiaClientFiles"><br />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do echo #pragma warning disable > %%f.temp" &#47;><br />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do type %%f >> %%f.temp" &#47;><br />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do attrib -r %%f" &#47;><br />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do move &#47;y %%f.temp %%f" &#47;><br />
  <Exec Command="for %%f in (@(RiaClientGeneratedFiles)) do attrib +r %%f" &#47;><br />
  <Message Text="CreateRiaClientFilesTaskDisableWarnings: @(RiaClientGeneratedFiles)" &#47;><br />
<&#47;Target><&#47;pre><br />
For some reason RIA creates those files read-only, hence usage of the attrib tool.</p>
<p>Voila, no RIA-related warnings any more coming from the generated files.<!--:--></p>
