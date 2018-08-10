---
layout: post
published: true
title: Hidden gem - easiest way to manage SqlLocalDB
date: 2018-05-06 18:20
categories:
- .net framework
- c#
description: I present a very simple library useful for executing tests against a real SQL Server database
keywords: sqllocaldb, testing, c#
comments: true
---

SQL Server LocalDB is not something new to me. The ability quickly to run, and destroy a database without much
hassle has been great aid in running test code which was meant to target a live SQL database. That said, it
wasn't always without any hassle at all. I tried various tools which make it a bit easier than the command line
tool but nothing was perfect. Until recently, when I've discovered the humbly named [NuGet package][p] which
is as simple as it gets.

[p]: https://www.nuget.org/packages/SqlLocalDb/

<!--more-->

## What is SQL LocalDB?

SQL Server LocalDB is a simple utility which ships with recent SQL Server editions (Express included). It let's
you create a temporary, yet full-featured database. It may not seem like much, after all it's possible with SQL
server itself to connect to `master` database, run `create database` and initialize it according to your needs.

The difference is though that one doesn;t have to manage two connections and doesn't have to share credentials
to the `master` database or require Windows Authentication. Instead, an automatic instance is always available
locally. However to run a fully isolated database it is necessary to create it, start it and eventually destroy.

```
> SqlLocalDB.exe create MyTestingDB
> SqlLocalDB.exe start MyTestingDB
> SqlLocalDB.exe stop MyTestingDB
> SqlLocalDB.exe delete MyTestingDB
```

It is also possible to use a magic `Server=(LocalDB)\MSSQLLocalDB` connection string (also supports
attaching to file db). Personally though I've had mixed results with using a connection string. To be honest
I never fully understood how it's supposed to be used ;).

## Managed code to the rescue

There are a number of C# libraries which aim at simplifying the use of SQL LocalDB. In a previous project
we had integration tests run against a temporary database created in code yet the steps still followed the 
same patter showed above:

1. Create LocalDB instance
1. Start the instance
1. Get its connection string
1. Create a ADO.NET connection
1. Stop the databse
1. Destroy it

I had a feeling back then that it's not as friendly as it could get and just this week, while migrating an
old [open source library of mine][r2rml4net] to .NET Standard I discovered what has to be the most 
hassle-free solution.

### SqlLocalDb.nupkg

Turns out it's not new but it somehow slipped under my radar the last time I was looking.

It's really dead simple to use it:

```c#
using(var database = new LocalDatabase())
{
    using (var connection = database.GetConnection())
    {
        connection.Open();
        
        // do your thing
        // run your tests
        // or whatever
    }
}
``` 

No need to manage the LocalDB instances at all. The library will make sure that it's created and then get
rid of it once the `LocalDatabase` object is disposed. It's as convenient as it gets.

[r2rml4net]: https://github.com/r2rml4net/r2rml4net
