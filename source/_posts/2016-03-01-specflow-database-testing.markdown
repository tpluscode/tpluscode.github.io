---
layout: post
published: false
title: Testing database access with SpecFlow and NDbUnit and LocalDb #dajsiepoznac
date: 2016-03-01 21:40
categories:
- dajsiepoznac
- gherkin
- specflow
- tests
description: A pleasant way to write specification-by-example tests against a physical database
comments: true
---

I know that some people will hate me for mixing the words **testing database with gherkin** all in one sentence, but I've
found that it's a quite nice combination. [Gherkin][Gherkin]'s [table feature][gherkin-table] ([SpecFlow][SpecFlow] in my
case) allow for very nice test definitions, with [NDbUnit][NDbUnit] it is quite simple to populate the database, and 
thanks to [LocalDb][LocalDb] the tests are beautifully portable.

<!--more-->

## Why unit test database?

![why test db](/uploads/2016/03/testing-db-wtf.jpg)

Wait, I never said that these are going to be unit tests right? More of integration tests. And how would you test 
repositories etc. without actual database? The name NdbUnit is kind of out of place though.

## My use case

A long time ago I implemented a small library called [r2rml4net][r2rml4net], which implements the [R2RML specification][r2rml]. 
R2RML is a RDF language, in which it is possible to map data from relational databases to [RDF][rdf]. What is RDF is
completely out of scope of this post. There's a good introduction [here][rdf-intro].

In my project I use my tool to convert an SQL database of public transport brochures I own to RDF for publishing over
the web. I wanted automatic tests for those mappings to ensure that the results are correct. Did I mention I have **a
lot** of those brochures? My wife almost hates me for it.

![over 1600 brochures](/uploads/2016/03/over-1600.jpg)

## Automatic database tests with SpecFlow

Most of the data sits in a table called `Sources.Source`. It's called that, because it holds brochures but also book and
magazine issues.

![database-table](/uploads/2016/03/table-diagram.png)

What r2rml4net does is convert a single row like

    +----+------------+----------+-----------+-------+-------------------------+
    | Id | SourceType | Language | Language2 | Pages | FolderName              |
    +----+------------+----------+-----------+-------+-------------------------+
    | 1  | folder     | tr       | en        | 2     | Türkkar City Angel E.D. |
    +----+------------+----------+-----------+-------+-------------------------+
    
Into some RDF data. Here it's turtle, which will be important in a moment.

``` turtle
@base <http://wikibus.org/> .
@prefix wbo: <http://wikibus.org/ontology#> .
@prefix bibo: <http://purl.org/ontology/bibo/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix graph: <http://data.wikibus.org/graph/r2rml/> .

<brochure/1> 
    a wbo:Brochure ;
    bibo:pages 2 ;
    dcterms:title "Türkkar City Angel E.D." ;
    dcterms:language <http://lexvo.org/id/iso639-1/tr>, 
                     <http://lexvo.org/id/iso639-1/en> .
```

## Defining the test case
 
Each test is structured int test same way. First I define the table(s) contents similarly to the ASCII art above and in
the `Then` clauses I write a [SPARQL query][sparql], which matches the expected result with the output data.
  
``` gherkin
Scenario: Mapping brochure row
   Given table Sources.Source with data:
      | Id | SourceType | Language | Language2 | Pages | FolderName              |
      | 1  | folder     | tr       | en        | 2     | Türkkar City Angel E.D. |
   When retrieve all triples
   Then resulting dataset should contain '6' triples
   And resulting dataset should match query:
      """
      base <http://wikibus.org/>
      prefix wbo: <http://wikibus.org/ontology#>
      prefix bibo: <http://purl.org/ontology/bibo/>
      prefix dcterms: <http://purl.org/dc/terms/>
      prefix graph: <http://data.wikibus.org/graph/r2rml/>

      ASK
      FROM <http://data.wikibus.org/graph/folder/1/imported>
      {
         <brochure/1> 
            a wbo:Brochure ;
            bibo:pages 2 ;
            dcterms:title "Türkkar City Angel E.D." ;
            dcterms:language <http://lexvo.org/id/iso639-1/tr>, 
                             <http://lexvo.org/id/iso639-1/en> .
      }
      """
```

**Notice how similar the SPARQL syntax is to that of turtle**. In simple English the above means:

* return a boolean value (`ASK`)
* stating that `graph <http://data.wikibus.org/graph/folder/1/imported>` 
* contains the data from inside `{ the curly braces }`

Right, enough RDF and SPARQL. Let's focus on testing database.

## Populating database with data

It was important to me that each test case runs a fresh database with ony the data defined in that test case alone. This
is when I found [NDbUnit][NDbUnit], which exposes an `INDbUnitTest` interface for manipulating database contents with
old skool `DataSet`s. Here's the code I execute at the beginning of each test scenario, which recreates and initializes
an LocalDb instance.

``` cs
public static INDbUnitTest Initialize(SqlConnection connection)
{
    // stop and delete database instance
    if (SqlLocalDbApi.GetInstanceInfo(InstanceName).Exists)
    {
        SqlLocalDbApi.StopInstance(InstanceName, TimeSpan.FromSeconds(10));
        SqlLocalDbApi.DeleteInstance(InstanceName, true);
    }

    // create database instance
    SqlLocalDbApi.CreateInstance(InstanceName);

    var database = new SqlDbUnitTest(connection);

    // init database with scripts
    database.Scripts.AddSingle("Scripts\\InitSchema.sql");
    database.Scripts.AddWithWildcard("Scripts", "InitTable_*.sql");
    database.ExecuteScripts();
    database.ReadXmlSchema(Resource.AsStream("Wikibus.xsd"));
    database.PerformDbOperation(DbOperationFlag.DeleteAll);

    return database;
}
```



[Gherkin]: 
[SpecFlow]: 
[NDbUnit]: 
[LocalDb]: 
[r2rml]: https://www.w3.org/TR/r2rml/
[gherkin-table]: 
[rdf]: 
[rdf-intro]: 
[r2rml4net]: http://r2rml.net
[sparql]: 