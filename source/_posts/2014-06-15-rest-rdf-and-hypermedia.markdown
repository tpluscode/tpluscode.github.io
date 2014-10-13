---
layout: post
status: publish
published: true
title: REST, RDF and Hypermedia
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 307
wordpress_url: http://t-code.pl/?p=307
date: !binary |-
  MjAxNC0wNi0xNSAxOTozMzo1NyAtMDQwMA==
date_gmt: !binary |-
  MjAxNC0wNi0xNSAxNzozMzo1NyAtMDQwMA==
categories:
- Uncategorized
tags:
- rdf
- hateoas
- hydra
- rest
comments: []
permalink: /:year/:month/:title/
---
<p><span style="color: #000000; font-size: 2.4em; line-height: 1.5em;">REST</span><br />
<a style="font-size: 16px;" href="http://en.wikipedia.org/wiki/REST">Representational state transfer</a> or&nbsp;REST defines a number of architectural constraints, which when applied allow building software, which is fast, scalable and simply interacted with.</p>
<p>TL;DR; RESTful application works very much like the Internet. A client requests a known resource by its identifier and follows links included in the representations to move to another state. No further information should be required by the client to know except the initiali identifier.</p>
<h2>REST constraints</h2><br />
As summed up on wikipedia, to implementa RESTful application a number of contraints must be fulfilled:</p>
<ol>
<li><a href="http://en.wikipedia.org/wiki/Client%E2%80%93server_model"><strong>Client-server</strong></a> - interface separates clients from servers</li>
<li><a href="http://en.wikipedia.org/wiki/Stateless_protocol"><strong>Stateless</strong></a> - server stores no client information between requests</li>
<li><strong><a href="http://en.wikipedia.org/wiki/Web_cache">Cacheable</a></strong> - allow and declare responses as cacheable, to improve performance</li>
<li><a href="http://en.wikipedia.org/wiki/Layered_system"><strong>Layered system</strong></a> - transparently stack intemediate proxies on top of the server</li>
<li><strong>Uniform interface</strong></li>
<li><strong><a href="http://en.wikipedia.org/wiki/Client-side_scripting">Code on demand</a> (optional)</strong></li><br />
</ol><br />
With the Web and HTTP being the usual transport for implementing a RESTful service, constraints 1 through 4 are generally understood. Also they are realized by components outside the scope of programmers such as proxies, servers, load balancers. Of course implementors must follow a set of rules to create a well-bahaved service, but the first four constraints generally cause least excitement and are well accepted. That is also partially true for the Uniform interface constraint. However it is the crucial component and also very much different from the typical RPC architectural and behavioral styles, it also causes most misunderstanding and heated discussion. Uniform interface states that:</p>
<ul>
<li>resources must be identified be identifiers, and that thy are separate from the resource representation</li>
<li>the representation must be used to manipulate resources</li>
<li>clients must communicate with the server using self-descriptive messages, that is the these message contain all information required to precess that request</li>
<li>the client chooses state transitions from alternatives included in the representations (<strong>Hypermedia as the engine of application state aka <a href="http://en.wikipedia.org/wiki/HATEOAS">HATEOAS</a></strong>)</li><br />
</ul><br />
Lastly there is the only optional constraint, which states that servers can include (small?) fragments of code for the clients to execute. These could be snippets in javascript&nbsp;or another scripting language, Flash components or even compiled code in Java or another language.</p>
<h1>RDF</h1><br />
With the advent of the Semantic Web many have seen RDF as means to create RESTful services. What is RDF? A short for Resource Description Framework, here's how it's described on <a title="RDF overview" href="http://en.wikipedia.org/wiki/Resource_Description_Framework#Overview">wikipedia</a>:<em> </em></p>
<blockquote><p>The RDF data model is similar to classic conceptual modeling approaches such as entity&ndash;relationship or class diagrams, as it is based upon the idea of making statements about resources (in particular web resources) in the form of subject-predicate-object expressions.</blockquote><br />
That <em>subject-predicate-object</em> expressions, called <strong><em>triples</em></strong> are the atoms of data in description of a RDF resource. For example triple like</p>
<blockquote><p><http://t-code.pl/about#tomasz> <http://xmlns.com/foaf/0.1/name> "Tomasz Pluskiewicz" .</blockquote><br />
means that there exists a resource identified by URI&nbsp;<http://t-code.pl/about#tomasz> (<em>subject</em>), whose name (<em>predicate</em>) is Tomasz Pluskiewicz (<em>object</em>). It is important to note that the predicate name is also identified by a URI and thus is a resource itself too. This means that not only data can be shared but also the nature of that data, which in an ideal world should allow clients to better understand that data and reason upon it. This is in fact a one of the premises of the Semantic Web!</p>
<h1>RESTful RDF?</h1><br />
RDF does seem like a good match for REST. It it a logical extension to the existing Web. It uses URI identifier for resources and those resources are decoupled from their representations. RDF resources can be represented using a wide selection of serialization formats like Turtle or JSON-LD. Unfortunately RDF itself falls short of fulfulling the complete set of REST constraints, because in itself it's not a hypermedia type. Hypermedia types are defined by <a href="http://amundsen.com/hypermedia/">Mike Amundsen</a> as follows</p>
<blockquote><p>Hypermedia Types are MIME media types that contain native hyper- linking semantics that induce application ow. For example, HTML is a hypermedia type; XML is not.</blockquote><br />
The most commonly used MIME for current Web Apis, JSON also is not a hypermedia type. This causes the clients to require out-of-band information to interact with a service. Bare RDF is almost good enough to build read only API. For example, given a triple (base URI) &nbsp; We could attempt to retrieve a representation of the&nbsp;<em></em> resource. But what if the resource is a web page (ie. has only a HTML representation available). Information about the nature of this resource could be defined in the description of the <em></em> property, but RDF has no standard way of defining hypermedia semantics. A bigger problem is encountered when one tries to build a read-write API based on RDF. For example here's a list of users interests (in Turtle):</p>
<blockquote><p></tomasz> <interest>&nbsp;"rdf", "semantic web", "c#" .</blockquote><br />
How do we state that a new item can be added to the list? What request must be sent?</p>
<h2>Hypermedia RDF</h2><br />
It is easy to understand, given that RDF has evolved to be a flexiible data model, that the hypermedia controls are lacking. That is because RDF focuses on defining data structures and their relationships. <strong>Hypermedia however is all about behaviour</strong>. There are a number of solutions, which intend to form a bridge between RDF and hypermedia, thus making a truly RESTful service:</p>
<ol>
<li><a href="http://www.w3.org/TR/ldp/">Linked Data Platform</a></li>
<li><a href="http://restdesc.org/">RESTdesc</a></li>
<li><a href="http://www.markus-lanthaler.com/hydra/">Hydra</a></li><br />
</ol><br />
Each on of these approaches proposes a slightly different approach. Linked data platform is a set of guidelines, which a conforming servers and clients should follow to allow a consistent interaction between them. RESTdesc enables server to embed metadata about hypermedia included in the representation in the form of <em>if..then</em>&nbsp;rules expressed in RDF, which define "<em>what it means to follow a link</em>". Hydra is similar to RESTdesc in that hypermedia cen be included directly in representations but it also allows building a centralized metadata of possible interactions. Unlike traditional API documetation, Hydra metadata is itself also RDF, which can be queried by the client at runtime to decide what options are available for the next transition.</p>
<h1>What next?</h1><br />
In upcoming posts I will try to give a concise example of using Hydra and next I will try to express my ideas for realizing the code-on-demand contraint by combining Hydra and <a href="http://spinrdf.org">SPIN</a>.</p>
