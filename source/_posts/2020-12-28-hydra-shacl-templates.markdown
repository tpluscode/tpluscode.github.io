---
layout: post
published: true
title: Hydra and SHACL - part 2 - IRI Templates
date: 2020-12-28
categories:
- rdf
- apis
- hypermedia
- semantic web
description: I propose patterns for using Hydra and SHACL together in order to create dynamic user interfaces according to Linked Data principles
keywords: rdf, hypermedia apis, hydra, semantic web
comments: true
---

In the [previous post][part-1] I presented the simplest functionality of loading remote form contents by having [SHACL][SHACL] property shape reference a [Hydra Core][Hydra] collection.

In the second part I will extend that example to create a form with multiple connected dropdowns, where each one is only populated when other(s) have been selected, which is a common scenario seen in (web) applications.

[Hydra]: http://www.hydra-cg.com/spec/latest/core/
[SHACL]: https://www.w3.org/TR/shacl/
[part-1]: /blog/2020/12/hydra-shacl-interoperability

<!--more-->

## TL;DR; can I see it working?

The screenshot below links to Shaperone Playground which implements the ideas described in the subsequent paragraphs.

[![shaperone playground](/images/shaperone/hydra-search.png)][playground]

## Filtering collections with Hydra

In addition to `hydra:collection`, the Hydra Core vocabulary comes with another general-purpose property `hydra:search`. Unlike most predicates which would link to another resource, identified by a concrete URI, its objects are instances of URI Templates, defined by [RFC6570](https://tools.ietf.org/html/rfc6570).

For example, let's have a "State collection" resource which returns country's first-level administrative division. It would come with a search template so that clients can construct filtered URIs:

<rdf-snippet formats="text/turtle,application/n-quads" prefixes="schema,hydra">
<script type="application/ld+json">
{
  "@context": {
    "@vocab": "http://www.w3.org/ns/hydra/core#",
    "schema": "http://schema.org/",
    "property": { "@type": "@id" }
  },
  "@id": "/states",
  "@type": "Collection",
  "search": {
    "@type": "IriTemplate",
    "template": "/states?country={country}",
    "mapping": [{
      "variable": "country",
      "property": "schema:addressCountry",
      "required": true
    }]
  }
}
</script>
</rdf-snippet>

The client must provide template values to a Hydra library which will return a URI fit for dereferencing. This is called `expansion` by the RFC6570. A Hydra client will take a graph node with values being attached to that node using the `hydra:property` as defined by the template and match those property/object pairs to the template variables.

Here's an example of such a template variable model, where JSON-LD `@context` has been constructed from the `hydra:mapping`, although the JSON keys may be irrelevant for the expansion if the implementation only relies on the actual graph data.

<rdf-snippet formats="text/turtle,application/n-quads" prefixes="schema,hydra">
<script type="application/ld+json">
{
  "@context": {
    "schema": "http://schema.org/",
    "country": "schema:addressCountry"
  },
  "country": { "@id": "http://www.wikidata.org/entity/Q27" }
}
</script>
</rdf-snippet>

Combine this with the template above to get

> `/states?country=http%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ27`

Read more about Hydra's template [here](http://www.hydra-cg.com/spec/latest/core/#templated-links)

## Connecting form fields

The idea is simple:

1. A SHACL Shape describes a graph structure
2. A form can be generated for agents (usu. humans) to create an instance of such a graph
3. Use the created graph to expand a template

Now, a form in such a scenario could simply be used to filter a collection for display, but I propose to short-circuit it back into the form itself so that the filtered collection, when dereferenced, provides values for other fields.

<rdf-snippet formats="application/ld+json,application/n-quads" prefixes="schema,hydra,sh,dash">
<script type="text/turtle">
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix schema: <http://schema.org/> .
@prefix dash: <http://datashapes.org/dash#> .
@prefix hydra: <http://www.w3.org/ns/hydra/core#> .

@prefix ex: <http://example.com/> .

schema:Person
  a rdfs:Class, sh:NodeShape ;
  rdfs:label "Register" ;
  sh:property ex:CountryProperty , ex:StateProperty .

ex:CountryProperty
  sh:name "Country" ;
  dash:editor dash:InstancesSelectEditor ;
  sh:path schema:addressCountry ;
  hydra:collection </countries> .

ex:StateProperty
  sh:name "State" ;
  sh:path ex:state ;
  dash:editor dash:InstancesSelectEditor ;
  hydra:search [
    hydra:template "/states?country={country}" ;
    hydra:mapping [
      hydra:property schema:addressCountry ;
      hydra:variable "country" ;
      hydra:required true ;
    ] ;
  ] .
</script>
</rdf-snippet>

The `Person` shape above has two properties. The first will generate a dropdown with a selection of countries as described in [the first Hydra+SHACL post][part-1]. The second, while it's also going to render a dropdown, will not be populated until a country is selected (`hydra:required true`).

The glue here is matching property shared between `sh:path` of the upstream field and `hydra:property` of the downstream's search template. In other words, when the form's graph node receives the value for the `schema:addressCountry` predicate, the "states" will be loaded.

## Less APIs, more Web Standards!

Again this time, the [playground][playground] example does not "talk" to an actual API but instead runs SPARQL queries encoded into query string parameters of Wikidata's query endpoint. The trick is to replace a URI of the variable with a URI Template placeholder. **Just gotta make sure that the braces are not percent-encoded**.

The query to load states is simple:

{% codeblock lang:sparql %}
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
prefix hydra: <http://www.w3.org/ns/hydra/core#>

CONSTRUCT {
  ?col a hydra:Collection .
  ?col hydra:member ?division .
  ?division rdfs:label ?label .
} WHERE {
  BIND ( <urn:contry:collection> as ?col )

  <{COUNTRY}> wdt:P150 ?division .
  ?division rdfs:label ?label .
  filter ( lang(?label) IN ( 'en', 'de', 'fr', 'pl', 'es' ) )
}
{% endcodeblock %}

Loading cities is slightly more complicated, accounting for deeper graphs where a state is the root and also various types of cities recognised by Wikidata.

{% codeblock lang:sparql %}
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
prefix hydra: <http://www.w3.org/ns/hydra/core#>

CONSTRUCT {
  ?col a hydra:Collection .
  ?col hydra:member ?city .
  ?city rdfs:label ?label .
} WHERE {
  BIND ( <urn:contry:collection> as ?col )

  <STATE> wdt:P150* ?city .
  ?city rdfs:label ?label .
  ?city wdt:P31 ?cityType .
  ?cityType wdt:P279 wd:Q515 .

  filter ( lang(?label) IN ( 'en', 'de', 'fr', 'pl', 'es' ) )
}
{% endcodeblock %}

Tried as I might, the cities query does not work for every country. United States, Germany and Poland are fine. On the other hand, for Colombia and Australia it finds no cities at all. Queries for Australian cities are also surprisingly slow...

It is not important for the example, but I would be curious to learn from a Wikidata expert how it can be improved.

<script src="{{ root_url }}/components/rdf-snippet.js"></script>

[playground]: https://forms.hypermedia.app/playground?resource=%7B%0A++%22%40context%22%3A+%7B%0A++++%22rdf%22%3A+%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%2C%0A++++%22rdfs%22%3A+%22http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%22%2C%0A++++%22xsd%22%3A+%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%22%2C%0A++++%22schema%22%3A+%22http%3A%2F%2Fschema.org%2F%22%2C%0A++++%22foaf%22%3A+%22http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%22%2C%0A++++%22vcard%22%3A+%22http%3A%2F%2Fwww.w3.org%2F2006%2Fvcard%2Fns%23%22%0A++%7D%2C%0A++%22%40id%22%3A+%22http%3A%2F%2Fexample.com%2Fjohn-doe%22%2C%0A++%22%40type%22%3A+%22schema%3APerson%22%2C%0A++%22schema%3AaddressCountry%22%3A+%7B%0A++++%22%40id%22%3A+%22http%3A%2F%2Fwww.wikidata.org%2Fentity%2FQ39%22%0A++%7D%0A%7D&selectedResource=http%3A%2F%2Fexample.com%2Fjohn-doe&shapes=%40prefix+sh%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fshacl%23%3E+.%0A%40prefix+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E+.%0A%40prefix+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E+.%0A%40prefix+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E+.%0A%40prefix+dash%3A+%3Chttp%3A%2F%2Fdatashapes.org%2Fdash%23%3E+.%0A%40prefix+hydra%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fhydra%2Fcore%23%3E+.%0A%40prefix+wdt%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E+.%0A%40prefix+wd%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E+.%0A%0A%40prefix+ex%3A+%3Chttp%3A%2F%2Fexample.com%2F%3E+.%0A%0Aschema%3APerson%0A++a+rdfs%3AClass%2C+sh%3ANodeShape+%3B%0A++rdfs%3Alabel+%22Register%22+%3B%0A++sh%3Aproperty+ex%3ANameProperty+%2C+%0A%09%09++++++ex%3ACountryProperty+%2C+%0A%09%09%09++ex%3AStateProperty+%2C%0A++++++++++++++ex%3ASubStateProperty+%3B%0A.%0A%0Aex%3ANameProperty%0A++sh%3Apath+schema%3Aname+%3B%0A++sh%3Aname+%22Name%22+%3B%0A++sh%3Adatatype+xsd%3Astring+%3B%0A++dash%3AsingleLine+true+%3B%0A++sh%3AmaxCount+1+%3B%0A++sh%3AminCount+1+%3B%0A++sh%3Aorder+10+%3B%0A.%0A%0Aex%3ACountryProperty%0A++sh%3Aname+%22Country%22+%3B%0A++sh%3Aclass+wd%3AQ6256+%3B%0A++dash%3Aeditor+dash%3AInstancesSelectEditor+%3B%0A++sh%3Apath+schema%3AaddressCountry+%3B%0A++sh%3AminCount+1+%3B%0A++sh%3AmaxCount+1+%3B%0A++hydra%3Acollection+%3Chttps%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fquery%3Dprefix%2520hydra%253A%2520%253Chttp%253A%252F%252Fwww.w3.org%252Fns%252Fhydra%252Fcore%2523%253E%250A%250ACONSTRUCT%2520%257B%250A%2520%2520%253Fcol%2520a%2520hydra%253ACollection%2520.%250A%2520%2520%253Fcol%2520hydra%253Amember%2520%253Fcountry%2520.%250A%2520%2520%253Fcountry%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%257D%2520WHERE%2520%257B%250A%2520%2520BIND%2520%2528%2520%253Curn%253Acontry%253Acollection%253E%2520as%2520%253Fcol%2520%2529%250A%250A%2520%2520%253Fcountry%2520wdt%253AP31%2520wd%253AQ6256%2520%253B%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%250A%2520%2520filter%2520%2528%2520lang%2528%253Flabel%2529%2520IN%2520%2528%2520%2527en%2527%252C%2520%2527de%2527%252C%2520%2527fr%2527%252C%2520%2527pl%2527%252C%2520%2527es%2527%2520%2529%2520%2529%250A%257D%3E+%3B%0A++sh%3Aorder+20+%3B%0A.%0A%0A%0Aex%3AStateProperty%0A++sh%3Aname+%22State%22+%3B%0A++sh%3Apath+schema%3AaddressRegion+%3B%0A++sh%3AminCount+1+%3B%0A++sh%3AmaxCount+1+%3B%0A++dash%3Aeditor+dash%3AInstancesSelectEditor+%3B%0A++hydra%3Asearch+%5B%0A++++hydra%3Atemplate+%22https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fquery%3DPREFIX%2520wd%253A%2520%253Chttp%253A%252F%252Fwww.wikidata.org%252Fentity%252F%253E%250APREFIX%2520wdt%253A%2520%253Chttp%253A%252F%252Fwww.wikidata.org%252Fprop%252Fdirect%252F%253E%250Aprefix%2520hydra%253A%2520%253Chttp%253A%252F%252Fwww.w3.org%252Fns%252Fhydra%252Fcore%2523%253E%250A%250ACONSTRUCT%2520%257B%250A%2520%2520%253Fcol%2520a%2520hydra%253ACollection%2520.%250A%2520%2520%253Fcol%2520hydra%253Amember%2520%253Fdivision%2520.%250A%2520%2520%253Fdivision%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%257D%2520WHERE%2520%257B%250A%2520%2520BIND%2520%2528%2520%253Curn%253Acontry%253Acollection%253E%2520as%2520%253Fcol%2520%2529%250A%2520%2520%250A%2520%2520%253C%7BCOUNTRY%7D%253E%2520wdt%253AP150%2520%253Fdivision%2520.%250A%2520%2520%253Fdivision%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%2520%2520filter%2520%2528%2520lang%2528%253Flabel%2529%2520IN%2520%2528%2520%2527en%2527%252C%2520%2527de%2527%252C%2520%2527fr%2527%252C%2520%2527pl%2527%252C%2520%2527es%2527%2520%2529%2520%2529%250A%257D%22+%3B%0A++++hydra%3Amapping+%5B%0A++++++hydra%3Aproperty+schema%3AaddressCountry+%3B%0A++++++hydra%3Avariable+%22COUNTRY%22+%3B%0A++++++hydra%3Arequired+true+%3B%0A++++%5D+%3B%0A++%5D+%3B%0A++sh%3Aorder+30+%3B%0A.%0A%0A%0Aex%3ASubStateProperty%0A++sh%3Aname+%22City%22+%3B%0A++sh%3Apath+schema%3AaddressLocality+%3B%0A++sh%3AminCount+1+%3B%0A++sh%3AmaxCount+1+%3B%0A++dash%3Aeditor+dash%3AInstancesSelectEditor+%3B%0A++hydra%3Asearch+%5B%0A++++hydra%3Atemplate+%22https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fquery%3DPREFIX%2520wd%253A%2520%253Chttp%253A%252F%252Fwww.wikidata.org%252Fentity%252F%253E%250APREFIX%2520wdt%253A%2520%253Chttp%253A%252F%252Fwww.wikidata.org%252Fprop%252Fdirect%252F%253E%250Aprefix%2520hydra%253A%2520%253Chttp%253A%252F%252Fwww.w3.org%252Fns%252Fhydra%252Fcore%2523%253E%250A%250ACONSTRUCT%2520%257B%250A%2520%2520%253Fcol%2520a%2520hydra%253ACollection%2520.%250A%2520%2520%253Fcol%2520hydra%253Amember%2520%253Fcity%2520.%250A%2520%2520%253Fcity%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%257D%2520WHERE%2520%257B%250A%2520%2520BIND%2520%2528%2520%253Curn%253Acontry%253Acollection%253E%2520as%2520%253Fcol%2520%2529%250A%2520%250A%2520%2520%257B%250A%2520%2520%2520%2520SELECT%2520%253Fcity%2520%253Flabel%2520WHERE%2520%257B%250A%2520%2520%2520%2520%2520%2520%253C%7BSTATE%7D%253E%2520wdt%253AP150%252B%2520%253Fcity%2520.%250A%2520%2520%2520%2520%2520%2520%253Fcity%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%2520%2520%2520%2520%2520%2520%253Fcity%2520wdt%253AP31%2520%253FcityType%2520.%250A%2520%2520%2520%2520%2520%2520%253FcityType%2520wdt%253AP279%2520wd%253AQ515%2520.%250A%2520%2520%2520%2520%257D%250A%2520%2520%257D%250A%2520%2520UNION%250A%2520%2520%257B%250A%2520%2520%2520%2520SELECT%2520%253Fcity%2520%253Flabel%2520WHERE%2520%257B%2520%2520%2520%2520%250A%2520%2520%2520%2520%2520%2520%253C%7BSTATE%7D%253E%2520wdt%253AP150%252B%2520%253Fcity%2520.%250A%2520%2520%2520%2520%2520%2520%253Fcity%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%2520%2520%2520%2520%2520%2520%253Fcity%2520wdt%253AP31%2520wd%253AQ515%2520.%250A%2520%2520%2520%2520%257D%250A%2520%2520%257D%250A%2520%2520filter%2520%2528%2520lang%2528%253Flabel%2529%2520IN%2520%2528%2520%2527en%2527%252C%2520%2527de%2527%252C%2520%2527fr%2527%252C%2520%2527pl%2527%252C%2520%2527es%2527%2520%2529%2520%2529%250A%257D%22+%3B%0A++++hydra%3Amapping+%5B%0A++++++hydra%3Aproperty+schema%3AaddressRegion+%3B%0A++++++hydra%3Avariable+%22STATE%22+%3B%0A++++++hydra%3Arequired+true+%3B%0A++++%5D+%3B%0A++%5D+%3B%0A++sh%3Aorder+40+%3B%0A.
