---
layout: post
published: true
title: Hydra and SHACL - a perfect couple - part 1
date: 2020-12-20
categories:
- rdf
- apis
- hypermedia
- semantic web
description: I propose patterns for using Hydra and SHACL together in order to create dynamic user interfaces according to Linked Data principles
keywords: rdf, hypermedia apis, hydra, semantic web
comments: true
---

[Hydra Core][Hydra] is a community-driven specification for describing hypermedia APIs in a machine readable form so that client applications can discover the resources at runtime. On its own, however, it is not expressible enough to describe any arbitrary resource representation.
[SHACL][SHACL], or Shapes Constraint Language, on the other hand is a beautifully extensible schema-like language which offers great power and flexibility in describing graph data structures.
Combined, they provide a complete solution for building hypermedia applications driven by RDF.

[Hydra]: http://www.hydra-cg.com/spec/latest/core/
[SHACL]: https://www.w3.org/TR/shacl/

<!--more-->

## TL;DR; I want some action!

Click the image to open Shaperone Playground, which demonstrates a working example of a form generated from a SHACL shape which dynamically loads Wikidata resources using SPARQL.

At the bottom of this post you will see how to configure [shaperone](https://github.com/hypermedia-app/shaperone) this way.

[![shaperone playground](/images/shaperone/hydra-collection.png)][playground]

[playground]: https://forms.hypermedia.app/playground?resource=%7B%0A++%22%40context%22%3A+%7B%0A++++%22rdf%22%3A+%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%2C%0A++++%22rdfs%22%3A+%22http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%22%2C%0A++++%22xsd%22%3A+%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%22%2C%0A++++%22schema%22%3A+%22http%3A%2F%2Fschema.org%2F%22%2C%0A++++%22foaf%22%3A+%22http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%22%2C%0A++++%22vcard%22%3A+%22http%3A%2F%2Fwww.w3.org%2F2006%2Fvcard%2Fns%23%22%2C%0A++++%22dcat%22%3A+%22http%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23%22%0A++%7D%2C%0A++%22%40id%22%3A+%22http%3A%2F%2Fexample.com%2Fjohn-doe%22%2C%0A++%22%40type%22%3A+%22schema%3APerson%22%2C%0A++%22schema%3Aname%22%3A+%22John+Doe%22%0A%7D&selectedResource=http%3A%2F%2Fexample.com%2Fjohn-doe&shapes=%40prefix+sh%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fshacl%23%3E+.%0A%40prefix+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E+.%0A%40prefix+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E+.%0A%40prefix+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E+.%0A%40prefix+dash%3A+%3Chttp%3A%2F%2Fdatashapes.org%2Fdash%23%3E+.%0A%40prefix+hydra%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fhydra%2Fcore%23%3E+.%0A%40prefix+wdt%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E+.%0A%40prefix+wd%3A+%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E+.%0A%0A%40prefix+ex%3A+%3Chttp%3A%2F%2Fexample.com%2F%3E+.%0A%0Aschema%3APerson%0A++a+rdfs%3AClass%2C+sh%3ANodeShape+%3B%0A++rdfs%3Alabel+%22Register%22+%3B%0A++sh%3Aproperty+ex%3ANameProperty+%2C+ex%3ACountryProperty+%3B%0A.%0A%0Aex%3ANameProperty%0A++sh%3Apath+schema%3Aname+%3B%0A++sh%3Aname+%22Name%22+%3B%0A++sh%3Adatatype+xsd%3Astring+%3B%0A++dash%3AsingleLine+true+%3B%0A++sh%3AmaxCount+1+%3B%0A++sh%3AminCount+1+%3B%0A++sh%3Aorder+10+%3B%0A.%0A%0Aex%3ACountryProperty%0A++a+sh%3APropertyShape+%3B%0A++sh%3Aname+%22Country%22+%3B%0A++sh%3Aclass+wd%3AQ6256+%3B%0A++dash%3Aeditor+dash%3AInstancesSelectEditor+%3B%0A++sh%3Apath+wdt%3AP27+%3B%0A++sh%3AminCount+1+%3B%0A++sh%3AmaxCount+1+%3B%0A++hydra%3Acollection+%3Chttps%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fquery%3Dprefix%2520hydra%253A%2520%253Chttp%253A%252F%252Fwww.w3.org%252Fns%252Fhydra%252Fcore%2523%253E%250A%250ACONSTRUCT%2520%257B%250A%2520%2520%253Fcol%2520a%2520hydra%253ACollection%2520.%250A%2520%2520%253Fcol%2520hydra%253Amember%2520%253Fcountry%2520.%250A%2520%2520%253Fcountry%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%257D%2520WHERE%2520%257B%250A%2520%2520BIND%2520%2528%2520%253Curn%253Acontry%253Acollection%253E%2520as%2520%253Fcol%2520%2529%250A%250A%2520%2520%253Fcountry%2520wdt%253AP31%2520wd%253AQ6256%2520%253B%2520rdfs%253Alabel%2520%253Flabel%2520.%250A%250A%2520%2520filter%2520%2528%2520lang%2528%253Flabel%2529%2520IN%2520%2528%2520%2527en%2527%252C%2520%2527de%2527%252C%2520%2527fr%2527%252C%2520%2527pl%2527%252C%2520%2527es%2527%2520%2529%2520%2529%250A%257D%3E+%3B%0A++sh%3Aorder+20+%3B%0A.%0A&disableEditorChoice=true&components=vaadin

## Hydra HTTP request descriptions

The Hydra vocabulary defines a term `hydra:Operation` which represents a HTTP request which a server advertises as being supported by specific resources, either by a specific instance or entire class of resources.

For the sake of this blog post, let's consider a hypothetical API which describes a registration request:

<rdf-snippet formats="application/ld+json,application/n-quads" prefixes="schema,hydra">
   <script type="text/turtle">
base <http://example.app/api#>
prefix schema: <http://schema.org/>
prefix hydra:  <http://www.w3.org/ns/hydra/core#>
prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#>

<UsersCollection>
  a hydra:Class ;
  rdfs:subClassOf hydra:Collection ;
  hydra:supportedOperation <RegisterUser> .

<RegisterUser>
  a hydra:Operation , schema:CreateAction ;
  hydra:method "POST" ;
  hydra:expects <User> ;
.

<User> a hydra:Class .
   </script>
</rdf-snippet>

The above snippet, excerpt from the API's [Documentation resource][apidoc], declares that the clients will come across a collection of users (`rdf:type <UserCollection>`) against which a POST request will be possible to create a new resource. That operation will require a representation of the `<User>` class.

While Hydra Core vocabulary does have a basic set of terms which can describe the user class, it may not be enough to cater for rich client-server interactions as well as a UI building block. Neither will be RDFS, and OWL, although quite powerful, is a little complex and seriously lacks tooling support and widespread recognition.

Enter, SHACL.

[apidoc]: http://www.hydra-cg.com/spec/latest/core/#documenting-a-web-api

## Using SHACL to describe API payloads

SHACL is another RDF vocabulary, which describes data graphs by constraining properties and values of precisely targeted nodes in an RDF graph. It could be used to complement the API Documentation graph above by providing the required shape of instances of the `<User>` class. This is easiest done by turning it into an [implicitly targeted][implicit] [`sh:NodeShape`][nodeshape].

[implicit]: https://www.w3.org/TR/shacl/#implicit-targetClass
[nodeshape]: https://www.w3.org/TR/shacl/#node-shapes

In this example let's require users to provide exactly one name (using `schema:name`) and exactly one country of citizenship (using said Wikidata property [P27](https://www.wikidata.org/wiki/Property:P27))

<rdf-snippet formats="application/ld+json,application/n-quads" prefixes="schema,hydra,sh,dash">
   <script type="text/turtle">
prefix hydra:  <http://www.w3.org/ns/hydra/core#>
prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
prefix sh:     <http://www.w3.org/ns/shacl#>
prefix schema: <http://schema.org/>
prefix dash:   <http://datashapes.org/dash#>
prefix wdt:    <http://www.wikidata.org/prop/direct/>
prefix wd:     <http://www.wikidata.org/entity/>
prefix xsd:    <http://www.w3.org/2001/XMLSchema#>

<User>
  a hydra:Class , rdfs:Class , sh:NodeShape ;
  sh:property [
    a sh:PropertyShape ;
    sh:path schema:name ;
    sh:name "Name" ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype xsd:string ;
    sh:minLength 3 ;
    sh:order 10 ;
    dash:singleLine true ;
  ] , [
    a sh:PropertyShape ;
    sh:name "Country" ;
    sh:class wd:Q6256 ;
    sh:path wdt:P27 ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:order 20 ;
    dash:editor dash:InstancesSelectEditor ;
  ] ;
.
   </script>
</rdf-snippet>

Hopefully this is quite self-explanatory so far.

1. The objects of `sh:property` require that any instance of `<User>` have exactly one of each property, declared using `sh:path`. That is achieved using `sh:minCount` and `sh:maxCount`
2. Name must be at least 3 characters long string
3. Country must be an instance of Wikidata Country class `wd:Q6256`
4. Exactly one country is allowed
5. `sh:order` is a UI hint for organising inputs in a form
6. `dash:singleLine` is a form builder hint which ensures that the text field does not allow line breaks (ie. no `<textarea>`)
7. `dash:editor` instructs the form builder to create an input component with a selection of instances of the desired RDF type

SHACL is quite wonderful in that shapes are useful for many purposes. Check the [SHACL Use Cases and Requirements](https://www.w3.org/TR/shacl-ucr/) note for a host of examples. In the presented scenario, a rich client can use to dynamically produce a form to have users input the data, and the server will run validations to check that requests payloads satisfy the SHACL constraints.

There is one piece missing however: **where do the Country instances come from?** 🤨

## Circling back to Hydra

Out of the box, a SHACL processor would assume that any instances would be part the [Data Graph](https://www.w3.org/TR/shacl/#data-graph). While this works for validation inside of TopBraid it is not feasible to build a browser application that way. For example, at the time of writing there are 171 instances of Country in Wikidata. Combined with a multitude of labels in various languages that is total of over 40 thousand triples. It's hardly a good idea to push that proactively to the client up front.

Instead, I propose to connect the Shape back with the API using Hydra Core term `hydra:collection`. It is defined modestly:

> Collections somehow related to this resource.

It also does not have and `rdfs:range` or `rdfs:domain` making it a good candidate for linking a property shape directly with its data source:

```diff
prefix hydra: <http://www.w3.org/ns/hydra/core#>
prefix sh: <http://www.w3.org/ns/shacl#>
prefix wdt: <http://www.wikidata.org/prop/direct/> 
prefix wd: <http://www.wikidata.org/entity/>

<User> 
  sh:property [
    a sh:PropertyShape ;
    sh:class wd:Q6256 ;
    sh:path wdt:P27 ;
+   hydra:collection <https://example.app/countries> ;
  ] ;
.
```

By adding this property a UI component can load the countries by dereferencing a `hydra:Collection` whose representation would look somewhat like this:

<rdf-snippet formats="application/ld+json,application/n-quads" prefixes="hydra">
   <script type="text/turtle">
prefix hydra: <http://www.w3.org/ns/hydra/core#>
prefix wd:    <http://www.wikidata.org/entity/>
prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

<https://example.app/countries>
  a hydra:Collection ;
  hydra:member wd:Q36 , wd:Q183 , wd:Q145 ;
  hydra:totalItems 171 ;
.

wd:Q36 rdfs:label "Poland"@en , "Polska"@pl , "Polen"@de .
wd:Q183 rdfs:label "Germany"@en , "Niemcy"@pl , "Deutschland"@de .
wd:Q145 rdfs:label "United Kingdom"@en , "Zjednoczone Królestwo"@pl , "Vereinigtes Königreich"@de .
   </script>
</rdf-snippet>

## APIs are dead; Long live (Linked Data) APIs!

![linked data mug](https://hydra.t-code.pl/img/linked_data.jpg)

So far the subject was APIs, but the web is more than just servers returning data, even if that data is RDF. You see, the hypothetical registration form above actually references a third party dataset, which is Wikidata. All of this data is already on the web and use standard formats. By using a simple SPARQL query the countries can be [fetched directly from their source](https://w.wiki/rsz); without even adding the `/countries` resource to your API. Heck, the client appication would not need a dedicated API at all!

{% codeblock lang:sparql %}
# wd: and wdt: are implicitly added by wikidata's SPARQL endpoint
prefix hydra: <http://www.w3.org/ns/hydra/core#>

CONSTRUCT {
  ?col a hydra:Collection .
  ?col hydra:member ?country .
  ?country rdfs:label ?label .
} WHERE {
  BIND ( <https://example.app/countries> as ?col )

  # wdt:P31 - "instance of"
  # wd:Q6256 - "country"
  ?country wdt:P31 wd:Q6256 ; rdfs:label ?label

  # only request labels in a handful of languages
  # to dramatically reduce response size
  FILTER ( lang(?label) IN ( 'en', 'de', 'fr', 'pl', 'es' ) )
}
{% endcodeblock %}

This query can be directly encoded in a URL to GET the countries and populate a dropdown component. You can see that in the [playground][playground], mentioned in the beginning.

All possible thanks to web standards 🤘

## Implementation notes

Shaperone makes building a Hydra-aware form like this easy:

```ts
import * as components from '@hydrofoil/shaperone-wc/NativeComponents'
// OR import * as components from '@hydrofoil/shaperone-wc-material/components'
// OR import * as components from '@hydrofoil/shaperone-wc-vaadin/components'
// OR roll your own rendering components
import * as configure from '@hydrofoil/shaperone-wc/configure'
import { instancesSelector } from '@hydrofoil/shaperone-hydra/components'

// register UI component which will do the rendering
configure.components.pushComponents(components)

// add Hydra extension to dash:InstancesSelectEditor
configure.editors.decorate(instancesSelector.matcher)
configure.components.decorate(instancesSelector.decorator())
```

The `@hydrofoil/shaperone-hydra` package extends the default behaviour to have `hydra:collection` dereferenced rather than looking for the instance data locally.

## Next steps

In future posts I will present how to:

2. use Hydra descriptions to find collections without `hydra:collection` directly
3. `hydra:search` URI Templates can be used to:
   - create forms with dependent fields, so that users first select a country which is then used to narrow down a selection of country's secondary administrative division and so on **[POST](/blog/2020/12/hydra-shacl-templates)**
   - improve performance by filtering resources on the data source

<script src="{{ root_url }}/components/rdf-snippet.js"></script>
