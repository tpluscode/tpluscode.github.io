---
layout: post
published: true
title: Living documentation with Literate Programming
date: 2014-12-05 20:00
updated: 2014-12-12 12:30
categories:
- c#
- unit tests
description: Practical application of the Literate Programming idea
comments: true
keywords:
  - c#
  - literate programming
  - visual studio
  - documentation
---

Two months ago, at the [Wrocław .NET USer Groups][spotkanie-69], [Luca Bolognese][luca] talked about Literate Programming.

For those who don't know, Luca Bolognese is best known for being the father of Microsoft's functional language __F#__.
He currently works for Credit Suisse - the Swiss-American investment bank where he implements uber-geek algorithms for
counting a lot of money :).

<!--more-->

__EDIT__: I've update the `.csproj` snippet, because previous code put all markdowns into project root. See [diff here](https://github.com/tpluscode/tpluscode.github.io/commits/source/source/_posts/2014-11-28-literate-documentation.markdown)

## Literate programming

Describe in early 80's by Donald Knuth, _Literate Programing_ where the program itself is mixed with it's description in
natural language. The idea is that a program is written like a book, where descriptions and code are subsequent chapters,
so to speak:

1. Write some thoughts about code about to be written
1. Write the aforementioned code
1. Go to 1

This must not be confused, as [wikipedia explains][code_doc], with documentation generated from code annotations such as
Java Doc od XML doc. Where documentation usually describes the API (and also usually quite poorly), literate programming
means that code descriptions, the natural language parts, describe not only the implementation but also the writer's
thoughts, which led to the given implementations. Typical XML doc in C# could look like this:

``` c#
/// <summary>
/// This method adds two numbers
/// </summary>
/// <returns>the result</returns>
public decimal Add(int x, int y)
{
   return x + y;
}
```

Basically this is redundant repetition of what can already be inferred from the method's signature and bear little extra
information. Instead on could write:

``` c#
/**
I needed a method to add two integer numbers.
It may seem weird that I return decimal but I've noticed
that colleagues find me smart if I do
**/

public decimal Add(int x, int y)
{
   return x + y;
}
```

This way the developer's thoughts are transferred into the source code. Usually this kind of information is lost and
shared only verbally as _tribal knowledge_. And more often than not such knowledge is completely lost, especially in
teams which often change.

### Literate programming, meet real life

I've not exactly wrapped my head around literate programming an entire .NET application. For once real-life code consists
of multiple source code file, which are not ordered in any particular way. I guess it would be possible to somehow
organize namespaces into "chapters" and compose them of sections for each class/interface or maybe source code file.
There are however additional obstacles such as various refactoring techniques. For example a method could be extracted.
It could be necessary to "refactor" the prose part of the source file. A non-trivial task, especially if the description
was written by another person.

And of course there is a complete lack of tooling to accomplish a task of generating sensible "book" from a large project.

## Literate documentation

It may be not so simple to implement an entire program with literate programming but I personally find it very useful
for creating living documentation. Usually code samples exist in one of two forms. Either as sample project, which shows
how a library/program is used through examples. Even if documented with code comments, such samples are hardly reader-friendly.
Very often (more often?) code samples are distributed as HTML or other documents with embedded code blocks, such as in
this blog posting. However unlike blog postings, documentation should be kept up-to-dat, which rarely the case. Once
created, static documentation is never updated in the future and quickly becomes outdated both in terms of the descriptions
and code snippets.

Alas, meticulously updated documentation suffers from an opposite problem, where users of older versions of a library
only get the latest documentation available on a project wiki. Even if such wiki is source controlled, such as with
GitHub or BitBucket, it's not immediately possible to reach an appropriate historical revision.

This is where literate programming comes handy but is not overwhelming. It takes the good from both approaches: you
create runnable code, which demonstrate the usage of a given feature. This ensures that any API changes force the code
to be update. With natural language description of the code, formatted in some kind of markup, stuffed between code
pieces it is possible to automatically generate beautiful markup documents, which are always up to date. It should be
even possible to convert them to PDF or RTF thanks to tools like [pandoc][pandoc].

### Can do that in .NET?

I've created living documentation for two of my latest projects: [Romantic Web][rw] and [JSON-LD Entities][ld-entities].

The first is a sample program, which uses the Romantic Web library. It is a standalone solution slash project, which
builds to a Windows executable file.

In the second project, a small serialization library, I took an alternate approach. I created a separate project in the
solution for documentation. In that project I add literate unit tests. This allows me not only to keep my documentation
updated, but also boost code coverage. The code can be downloaded an debugged but learners just the same

In both cases I can continuously integrate. I can tag the repository to align the code sample with changes in the
library and so users of different version don't get confused when they are using an older incarnation of the code.

### So how do you do it?

Luca Bolognese create a small tool, called LLite, which processes a single code file in C#, F#, C or Java and simply
turns the code "inside out" by unwrapping literate comment blocks and wrapping code in specified markers os simply indenting,
thus creating a markdown or similar document. The tool's code is [available on GitHub][llite]. No binary is readily
available so if you have trouble building (it's F#), go ahead and grab the exe from the repositories mentioned above.
And of course LLite is itself written in the literate programming style!

Here's what I do to convert a file to markdown with C# code blocks

```
llite.exe Program.cs -co "``` c#" -cc "```" -o readme.md
```

Simple as that you can put it in your build pipeline to produce a markdown doc for each code file in your project. Here's
my documentation target in MSBuild

``` xml
<ItemGroup>
  <Compile Include="Readme.cs" />
</ItemGroup>
<Target Name="Generate Doc" AfterTargets="Build">
  <Exec Command="$(path)\llite.exe %(Compile.FullPath) -l csharp -co &quot;``` c#&quot; -cc ```"
        WorkingDirectory="%(Compile.RelativeDir)"/>
</Target>
```

This way each source code file added to the `.csproj` is processed. It could be then committed into the library or
automatically extracted and pushed to a wiki repository.

[spotkanie-69]: http://wrocnet.github.io/2014/09/16/69-spotkanie-wroclawskiej-grupy-net.html
[luca]: http://lucabolognese.wordpress.com/
[code_doc]: http://en.wikipedia.org/wiki/Literate_programming#Contrast_with_documentation_generation
[pandoc]: http://johnmacfarlane.net/pandoc/
[rw]: https://github.com/MakoLab/RomanticWeb.Sample
[ld-entities]: https://github.com/wikibus/JsonLD.Entities/
[llite]: http://github.com/lucabol/LLite
