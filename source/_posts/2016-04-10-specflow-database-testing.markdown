---
layout: post
published: true
title: Testing database access with SpecFlow and NDbUnit and LocalDb
date: 2016-04-10 20:30
categories:
- dajsiepoznac
- gherkin
- specflow
description: A moderately pleasant way to write specification-by-example tests against a physical database
comments: true
---

I know that some people will hate me for mixing the words **testing database with gherkin** all in one sentence, but I've
found that it's a quite nice combination. [Gherkin][Gherkin]'s [table feature][gherkin-table] ([SpecFlow][SpecFlow] in my
case) allow for very nice test definitions, with [NDbUnit][NDbUnit] it is quite simple to populate the database, and
thanks to [LocalDb][LocalDb] the tests are beautifully portable.

<!--more-->

## Why unit test database?

![why test db](/uploads/2016/03/testing-db-wtf.jpg)

Wait, I never said that these are going to be unit tests right? More of integration tests. Otherwise how would you test
repositories etc. without actual database? 

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

Right, enough RDF and SPARQL. Let's focus on testing the database.

## Preparing the dataabse for tests

It was important to me that each test case runs a fresh database with only the data defined in that test case alone. This
is when I found [NDbUnit][NDbUnit], which exposes an `INDbUnitTest` interface for manipulating database contents with
old skool `DataSet`s. Here's the code I execute at the beginning of each test scenario, which recreates and initializes
an LocalDb instance.

{% codeblock lang:c# %}
private const InstanceName = "WikibusTest";
public static readonly string TestConnectionString = ConfigurationManager.ConnectionStrings["sql"].ConnectionString;

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

    // init database with some scripts
    database.Scripts.AddSingle("Scripts\\InitSchema.sql");
    database.Scripts.AddWithWildcard("Scripts", "InitTable_*.sql");
    database.ExecuteScripts();
    // initialize schema from DataSet
    database.ReadXmlSchema(Resource.AsStream("Wikibus.xsd"));

    return database;
}
{% endcodeblock %}

As you see I had to create a `DataSet` to be able to load data in each test case. More on that later. And of course I had
to create the dataset `Wikibus.xsd` to match the database structure:

![dataset-table](/uploads/2016/03/dataset.png)

The `SqlLocalDbApi` is also of great help. [Before][old-database-init] I would first connect to `master` to create the 
database for tests. Without that it's not possible to connect to SQL Server and so I had to keep two connection strings. 
Now there is only one and the code above ensures that the instance is available and recreated every time. The only 
requirement is that the `InstanceName` matches what you have in the connection string.

``` xml
<connectionStrings>
  <add name="sql" connectionString="Data Source=(localdb)\WikibusTest;Integrated Security=true;" />
</connectionStrings>
```

It even works out of the box on [AppVeyor][AppVeyor] and doesn't care whether developers have their SQL instance named
that way or another! All you need is SQL Server installed (I think it's 2012 or newer). Oh and did I mention that you can
connect to this database using SQL Server Management Studio? :smile:

![connection to LocalDb](/uploads/2016/03/localdb.png)

## Populating database with data

With that ready I can now fill the database with some data. Here's how I bind the `Given` step above to a SpecFlow method

{% codeblock lang:c# %}
private readonly SqlConnection _sqlConnection;
private readonly INDbUnitTest _database;

public MappingSourcesSteps()
{
    _sqlConnection = new SqlConnection(Database.TestConnectionString);
    _database = Database.Initialize(_sqlConnection);
}

[Given(@"table (.*) with data:")]
public void GivenTableWithData(string tableName, Table table)
{
    var datasetFile = Path.GetTempFileName();
    DataSet ds = table.ToDataSet(tableName);
    ds.WriteXml(datasetFile);
    _database.AppendXml(datasetFile);
}
{% endcodeblock %}

That's actually quite simple. The only hard and boring part is to convert the weak `Table` into a `DataSet1 object for
loading. It's simple copying the table values for each row. As long as the header names match column names all is dandy.
The source code can be viewed [on GitHub][TableExtensions] of course.

## Summary

And that's it. Now I can proceed with the `When` and `Then`s to run the code I want tested and with every test case I am
starting with a blank database so that each test is guaranteed to be independent from any other.

[Gherkin]: https://github.com/cucumber/cucumber/wiki/Gherkin
[SpecFlow]: http://www.specflow.org/
[NDbUnit]: https://github.com/NDbUnit/NDbUnit
[LocalDb]: https://msdn.microsoft.com/pl-pl/library/hh510202%28v=sql.110%29.aspx
[r2rml]: https://www.w3.org/TR/r2rml/
[gherkin-table]: https://cucumber.io/docs/reference#data-tables
[rdf]: https://en.wikipedia.org/wiki/Resource_Description_Framework
[rdf-intro]: http://www.dataversity.net/introduction-to-rdf/
[r2rml4net]: http://r2rml.net
[sparql]: https://www.w3.org/TR/sparql11-overview/
[AppVeyor]: https://www.appveyor.com
[TableExtensions]: https://github.com/wikibus/data.wikibus.org/blob/master/src/wikibus.tests/Mappings/TableExtensions.cs#L14
[old-database-init]: https://github.com/wikibus/data.wikibus.org/blob/2bf2d98226a023c0784d0ab69c4e9890607d2924/src/wikibus.tests/Mappings/Database.cs#L14