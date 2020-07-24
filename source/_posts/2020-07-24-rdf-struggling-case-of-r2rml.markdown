---
layout: post
published: true
title: Why RDF is struggling - the case of R2RML
date: 2020-07-24
categories:
- rdf
- r2rml
- semantic web
description: I look into the world of R2RML implementations in the wild to give an example of a failed software maintenance and stewardship, and community-building in general within the Semantic Web space.
keywords: rdf, r2rml, semantic web
comments: true
---

In 2012 I started my .NET implementation of [R2RML][R2RML] and [RDB to RDF Direct mapping][direct] which I called [r2rml4net](https://github.com/r2rml4net/r2rml4net). It never reached the maturity it should have but now, 8 years later, I have little choice but to polish it and use it for converting my database to triples. A task I had originally intended but never really completed.

Why is it significant? Because all those years later the environment around R2RML as a standard is almost as broken, incomplete and sad as it was when I started. Let's explore that as an example of what is wrong with RDF in general.

[R2RML]: https://www.w3.org/TR/r2rml/
[direct]: https://www.w3.org/TR/rdb-direct-mapping/

<!--more-->

## Intro. What is R2RML?

**R2RML** and **Direct Mapping** are two complementary W3C recommendation (specifications) which define language and algorithm respectively which are used to transform relation databases into RDF graphs. The first is a full blown, but not overly complicated RDF vocabulary which lets designers hand-craft the way in which relational tables are converted into RDF. Individual columns are either directly converted into values (taking their respective database types into consideration) or used within simple templates to produce compound values as literals, blank node and literal alike.

Direct Mapping is a simpler approach, often using R2RML internally as the mapping model, which creates an automatic mapping from any given relational database into triples. The specification defines way in which tables, rows and values are meant to map into triples. It can be either executed standalone and then the resulting RDF would be refined, or an R2RML document can be produced so that it can be fine-tune before the actual transformation happens.

Complementary to these two specs there are a two sets of test cases which can be exercised by implementors claiming compatibility and advertised at a central [RDB2RDF implementation report][impl] page hosted by W3C.

Related to R2RML, there is also a newer specification [RML.io](https://rml.io) which extends it into supporting also other sources like XML and CSV.

[impl]: https://www.w3.org/TR/rdb2rdf-implementations/

## Why is it important?

I had an interesting twitter exchange recently where I tried to present arguments why applying RDF selectively, without really using it in every layer of the application architecture is problematic.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">You need to look at the big picture, entire stack of a single or multiple applications<br><br>Polyglot persistence becomes a burden if you convert JSONs and relational data into RDF all the time<br><br>If RDF is not your programming model then you&#39;re in for pain<br><br>And no, JSON-LD is snake oil</p>&mdash; Tomasz Pluskiewicz (@tpluscode) <a href="https://twitter.com/tpluscode/status/1283701660552962048?ref_src=twsrc%5Etfw">July 16, 2020</a></blockquote>

In that case JSON-LD got the bashing but the bottom like here is that when building an application using RDF technologies it is worth using it in all software components. From the user interface all the way to the database. This is the only way which prevents constant tension between graph and non-graph models, such as the mentioned issue where JSON-LD hides the graphy nature of data. It is a similar problem which haunted software where relation data model is mapped into object complex models. For that I recommend the classic blog post by Jeff Atwood titled [Object-Relational Mapping is the Vietnam of Computer Science(https://blog.codinghorror.com/object-relational-mapping-is-the-vietnam-of-computer-science/)

R2RML should be an important tool in the toolkit of any *Semantic Web development team* as it aims to provide an effective way for migrating existing datasets stored in SQL silos into RDF. This can be done by performing a one-time conversion as mentioned above but an alternative approach some take is running the mapping on-demand, for example by translating SPARQL queries into SQL without ever persisting the converted triples.

---

You could think that surely, over the years we should have grown a vibrant ecosystem around this cornerstone piece of technology. Well, think again...

## My humble requirements

For my use case I have simple requirements. I need to perform a fairly simple mapping of a handful of tables into quads. That is, I want to partition the dataset into named graphs, mostly in a graph-per-entity fashion. Pretty standard as R2RML goes.

My database is Azure SQL so MS SQL has to be supported.

I expect also ease of use. Preferably a standalone CLI, easily installed and usable on CI.

## R2RML implementations in the wild

The first logical place to look for R2RML software should be the [Implementation Report][impl]. It lists 8 implementations, 4 out of which implement both R2RML and Direct mapping:

1. [RDF-RDB2RDF](https://metacpan.org/release/RDF-RDB2RDF) (both)
2. [XSPARQL](https://github.com/semantalytics/xsparql) (both)
3. [ultrawrap](http://www.capsenta.com/) (both)
4. [db2triples](https://github.com/antidot/db2triples) (both)
5. [D2RQ](http://d2rq.org/) (Direct Mapping)
6. [SWObjects dm-materialize](http://swobjects.svn.sourceforge.net/) (Direct Mapping)
7. [OpenLink Virtuoso](http://virtuoso.openlinksw.com/) (R2RML)
8. [morph](https://github.com/jpcik/morph) (R2RML)

The listing is clearly not actively maintained (last updated in August 2012) so one would also try searching so the latest and greatest. Here's what I found:

1. [Ontop](https://ontop-vkg.org)
2. [Karma](https://github.com/usc-isi-i2/Web-Karma)
3. [d2rq/r2rml-kit](https://github.com/d2rq/r2rml-kit)
4. [chrdebru/r2rml](https://github.com/chrdebru/r2rml)
5. [CARML](https://github.com/carml/carml) (RML)
6. [RML.io RMLMapper](https://github.com/RMLio/rmlmapper-java) (RML)
7. [SDM-RDFizer](https://github.com/SDM-TIB/SDM-RDFizer) (RML)
8. [RocketRML](https://github.com/semantifyit/RocketRML) (RML)

Let's take a closer look to check if they present a viable option. I'm only interested in R2RML so that eliminates D2RQ and SWObjects dm-materialize but let's check them out either way.

Of the RML implementations, CARML and RocketRML do not support SQL data source and SDM-RDFizer does not support SQL Server. That leaves RMLMapper.

Finally, there are a bunch of commercial products which incorporate R2RML and other kinds of mappings and migrations from other data sources to semantic graphs. Names like Stardog or Anzo which are aimed at big corporate settings. They often don't have free versions, require adopting their entire, integrated environment and cost big buck.

### RDF-RDB2RDF

| Version | 0.008 | 😕 |
| Last release | 2013-09-20 | 👎 |
| Installation | Perl package manager | 👎 |
| Developed by | individual ||

The project page is rather developer-centric. An **INSTALL** file linked in an **Other files** section says

> Installing RDF-RDB2RDF should be straightforward.
> If you have cpanm, you only need one line:

```
% cpanm RDF::RDB2RDF
```

Looks simple, but I have no idea about PERL and `cpanm`. There is also a `README` file but the usage instructions are rather uninformative. I think this is only a library. Even if this gets the job done, there is no way I'm learning PERL for this 🙄

### XSPARQL

While the address linked from the implementation report is now dead, a quick google reveals its new home on GitHub.

| Version | 1.1.0 | 👍 |
| Last release | 2019-02-04 | 👍 |
| Installation | `.jar` download | 🙄 |
| Developed by | Company (?) ||

The R2RML feature is not well advertised but found in the wiki under [Working with RDBMS SQL](https://github.com/semantalytics/xsparql/wiki/Working-with-RDBMS-SQL)

Configuration is provided using a `.properties` file. Awkward but doable. Unfortunately the project does not show an example of how to set it up.

### ultrawrap

| Developed by | Company ||

The linked company Capsenta redirects to [https://data.world](https://data.world) and appears to be a commercial product. There is also a **Community tier** of what seems to be a SaaS offering.

Not sure about this one.

### db2triples

| Version | 2.2 | 👍 |
| Last release | 2019-08-02 | 👍 |
| Installation | Build with maven | 👎 |
| Developed by | Company ||

This one looks promising. Sadly, it appears that the sources have to be built manually. No thank you. On the other hand the `format` parameter can be one of `'RDFXML', 'N3', 'NTRIPLES' or 'TURTLE'` so I guess no named graphs? 😢

### D2RQ

| Version | 0.8.1 | 👌 |
| Last release | 2012-06-22 | 👎 |
| Installation | Download from d2rq.org | 🙄 |
| Developed by | Universities ||

Anyway, only Direct Mapping and unmaintained but if it works, it works...

### SWObjects dm-materialize

❌ It's dead Jim

### OpenLink Virtuoso

| Version | 7.2 | ✨ |
| Last release | 2018-08-15 | 👍 |
| Installation | Dedicated installers + a plugin | 😕 |
| Developed by | Company ||

Virtuoso is a well-known name in the RDF space. It is a commercial product and a triple store. Support for R2RML comes as an add-on and the overall setup looks super complicated and not at all standalone 👎. Sorry

### morph

| Version | 1.0.6 | 👌  |
| Last release | 2013-11-05 | 👎 |
| Installation | Maven library | 😕 |
| Developed by | Individual ||

Another package which would have the users create a Java/Scala project and add a library from a package manager. Thank you, but no thank you.


### Ontop

| Version | 4.0-rc1 | 👌  |
| Last release | 2020-06-08 | 🎉 |
| Installation | JAR download | 👌 |
| Developed by | University ||

Ontop is mainly a Virtual Graph endpoint, like d2rq, but comes with a CLI command `materialize` which takes a R2RML mapping graph and serializes the resulting triples to a file.

Unfortunately, at the time of writing named graphs [are not supported](https://github.com/ontop/ontop/issues/343). The project is very actively maintained and that might change very soon.

### Karma

| Version | 2.4 | 👍 |
| Last release | 2020-06-03 | ✨ |
| Installation | GUI? `mvn exec:java`? | 😕 |
| Developed by | University ||

Another super active but also quite complex tool. An installation page shows how to install a GUI tool. The README gives examples of commands running Maven within a clone of the original repository. Maybe I'm missing something but it does look like it falls into "easy of use" category.

To do it justice, this definitely looks super useful as a

> an information integration tool that enables users to quickly and easily integrate data from a variety of data sources

as advertised in the repo. Not what I'm looking for though.

### d2rq/r2rml-kit

| Version | N/A | 👎 |
| Last update | 2019-06-19 | ✨ |
| Installation | scripts in repository | 😕 |
| Developed by | Individual (?) ||

> r2rml-kit is an offshoot of D2RQ, based on its abandoned develop branch
> r2rml-kit is currently in pre-alpha stage.

Not only is it **pre-alpha**, it is also not really maintained. Too bad...

### chrdebru/r2rml

| Version | N/A | 👎 |
| Last update | 2020-04-13 | 👌 |
| Installation | build sources | 👎 |
| Developed by | Individual ||

Another Java project which fails to even provide a pre-built JAR. This one has at least seen some development recent time and claims to support quad output formats. Maybe worth a go.

### RMLMapper

| Version | 4.8.1 | ✨|
| Last release | 2020-07-03 | 🎉 |
| Installation | docker run | 👌 |
| Developed by | University ||

The last RML implementation looks promising too. Actively maintained, supports SQL server, outputs quads, uses modern tooling. A definite candidate for success.

## Summary

For such a crucial piece of software it's quite disappointing to see in what state the environment is and how little it has changed since 2012 when I first had a look at R2RML.

The old implementations died off or became commercial products. C'est la vie.

The surviving ones on the other hand mostly fail to provide a usable package. Why should I be interested in running Maven or even manually downloading a JAR to run. Where is the simplicity of package managers effortless installation one can find in JavaScript (`npm i -g hypothetical-r2rml`) or the latest .NET (`dotnet tool install -g hypothetical-r2rml`). Once installed it should simply create a global executable to run the transformation.

And why are so many poorly documented? Again, I can mostly speak of JS and .NET ecosystems and there are plenty of examples of beautiful, detailed documentation pages and guides. How is it possible that most of those above fail on that front.

Maybe I'm being unfair about that last point. Much software is poorly documented and I have been guilty of that myself in the past but for the RDF community at large it should be critical to provide working, well documented software in order for semantic technologies to achieve any wider recognition.

Finally, I would have said in the past that universities are part of the problem and the Semantic Web has been long viewed as academic and impractical. It pleases me to see that but of the above, the more recent uni-managed packages actually stand out as being more modern and better maintained overall. 👍

And I have not even looked at test coverage but I do not dare.

## Coming next

In the end, it's still a little disappointing how limited the choice seems for someone looking for an unimposing but functional R2RML solution. In the two lists above I gathered 16 potential candidates out of which only a handful remain:

1. **XSPARQL** (config is going to be a trial & error thing)
2. **db2triples** (only if the docs are inaccurate and named graphs are supported)
3. **Ontop** (no named graph but deserves a closer look)
4. **chrdebru/r2rml**
5. **RMLMapper**

I initially intended to give more details about each of the promising implementation in this post but I decided that I should look in more detail and actually try running and comparing those most promising implementations to see if they can actually deliver. In a subsequent post I will take my mappings and try processing them with the 5 tools I selected.
