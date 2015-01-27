---
layout: post
published: true
title: Using R2RML to translate SPARQL to SQL
date: 2014-11-06 10:00
categories:
- r2rml
- sparql
- sqlserver
description: About the .NET R2RML library for querying SQL with SPARQL
comments: true
keywords: r2rml, sql server, sql, sparql, semantic web
---

A long time ago, back in 2011, I have implemented the [R2RML][r2rml] using [dotNetRDF][dotNetRDF]. 

R2RML is a specification, which defines how to map SQL databases to RDF triples. This way it is possible to publish existing data from relational databases as [Linked Data][ld] to give one example

<!--more-->

## Do we need it?

One could argue that there are other implementations of R2RML or similar such as D2RQ. Unfortunately some are not free and none existed (and I think still don't as of late 2014) for the .NET platform. Also I treated the work I did as training ground for my programming skills. I guess many developers will sympathize with coding to learn.

This way the [r2rml4net](http://r2rml.net) was born. It implements the R2RML specification and [Direct Mapping][dm], which in this case works by creating a R2RML mapping document from the tables. Initially I've added support for SQL Server only. Truth be told the code has sat there pretty much neglected ever since, but that may finally change.

## So why r2rml4net?

I started the project not only to learn but with the intent to actually use it. I have maintain a small database and a simple CRUD app for managing my collection of bus brochures that I occasionally purchase. The collection has grown big enough that my Excel sheet I had previously wasn't enough anymore. One thing I also wanted were cover scans so that I don't accidentally buy brochures that I already have - and it has happend all too often in the past.

My choice at the time was to quickly assembly a Windows Forms app backed by SQL Server database. The databse also holds all my books and magazine issues. Initially I wanted that database to be the base for a knowledge base about buses, trams and other aspects of public transport. A project I've been planning for many years. I even have set up a MediaWiki site at some point. In the meantime I discovered the Semantic Web and RDF, which completely changed my view of publishing data on the web.

### Mapping isn't enough

Converting entire relational database to triples isn't perfect. It makes sense only for small databases, because each change forces regeneration, at least partial. And what about the result? Do we keep it in memory? Or maybe put it in another database at the cost of duplication?

## dotnetr2rmlstore

My long-term idea was indeed to create a SPARQL-SQL translator, which would dynamically query the tables. I haven't had time to do that and in the meantime it got beaten to it by Miloš Chaloupka, who implements an SQL backed SPARQL endpoint. 

It reads the r2rml metadata, translates SPARQL queries to SQL and can exposes an endpoint by integrating with dotNetRDF. Miloš is developing the project as part of his master thesis and will continue on during doctoral studies.

The project isn't yet published and is mostly unfinished but I have high hopes. Fingers crossed :)

[r2rml]: http://www.w3.org/TR/r2rml/
[dotNetRDF]: http://dotnetrdf.org
[ld]: http://en.wikipedia.org/wiki/Linked_data
[dm]: http://www.w3.org/TR/rdb-direct-mapping/
[d2rq]: http://d2rq.org/
[Ultrawrap]: http://capsenta.com/architecture/
