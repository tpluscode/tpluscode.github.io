---
layout: post
published: false
title: Now I'm storing my RDF triples in the cloud (or is it tree?) &#35;dajsiepoznac
date: 2016-03-06 20:50
categories:
- dajsiepoznac
- semantic web
- rdf
description: First steps with Dydra, the free, cloud-based graph store
comments: true
---

I've been building my wikibus.org code on AppVeyor, which is quite neat and used it to publish over WebDeploy to my VPS.
Having recently watched a convincing presentation about Heroku on [Wrocław .NET User Group][wrocnet] I decided that maybe
it will be an interesting experience.

<!--more-->

## In the beginning there was file

As I wrote, I am a keen collector of any printed, public transport-related material such as promotional brochures and books.
I've created a small tool, which helps me manage my collection. It was crucial for me at some point, because it had happened
more than once that I bought another copy of something I already had :grimacing:. With the tool I can scan and import the 
cover and input some basic data about my collection.

![My knowledge base tool](/uploads/2016/03/sources-kb-list.png)

![My knowledge base tool](/uploads/2016/03/sources-kb-item.png)

Default and obvious choice at the time was SQL Server. Now however, lured by the glorious vision of [Linked Data][ld] I
intend to publish my collection (and other, *real* wikibus stuff later) as [RDF][RDF]. Thus I convert my tables from
relations to graphs using [R2RML][r2rml] - that I will also expand upon in another post. But because my experience with
triplestores was rocky at best, I decided to keep the small dataset (roughly 20k facts) in a file. That would be generated
at first application start and loaded to memory for querying.

Of course that's not a perfect solution and so I recalled that out there a free, cloud-based triple store exist.
 
## Welcome Dydra, the data tree

![data tree](/uploads/2016/03/datatree.png)

Dydra signup page says that invite code is required to create an account. It doesn't mean that another registered user
is required. It simply means that an invitation request must be sent, before one can register. I didn't have high hopes
but to my pleasant surprise, I got my code within two days. :+1:.

Interestingly, Dydra is completely free of charge. A paid service is available, but on a case-by-case basis as far as I
can tell.

### Creating a repository

Dydra hosts their files somewhere over at Amazon :cloud:, and user's data is split into virtual ***repositories***. Upon
logging in for the first time in I can create on straight away and then import some existing data. I imported my converted 
triples.

{% video /uploads/2016/03/dydra-repo.webm 900 658 /uploads/2016/03/dydra-repo.png %}

As you see above, a repository can be assigned various levels of privacy between *completely private* to *visible to anyone*.
Unfortunately, [what looks like a bug to me][issue], a public repository can not only be viewed by anyone but also modified.
**Beware** :skull:

### Accessing Dydra repositories

Dydra repositories are accessible over standard SPARQL endpoints and can also be downloaded in various RDF syntaxes. Simple.

{% video /uploads/2016/03/dydra-endpoints.webm 900 658 /uploads/2016/03/dydra-endpoints.png %}

Private repositories can be access by using a [number of authentication options][auth] :+1:.

### SPARQL Online
 
Lastly, Dydra has this cool little feature they call views, which can be used to create canned queries. Those queries can
then be accessed over the web in a number of formats. [If only they allowed input parameters][issue2] :pray:.

{% video /uploads/2016/03/dydra-views.mp4 900 658 /uploads/2016/03/dydra-views.png %}

## Go Dydra!

I must say I like Dydra pretty much. There may be minor issues, like [not using `https` by default][issue3] and problems
I mentioned above. However all in all it's a very simple yet powerful solution. Did I mention it's free? :smile: I remains
to see how performant the repositories are and how quick the team responds to [support issues][support].

[dydra]: http://dydra.com
[ld]: http://linkeddata.org/
[RDF]: https://en.wikipedia.org/wiki/Resource_Description_Framework
[r2rml]: https://www.w3.org/TR/r2rml/
[issue]: https://github.com/dydra/support/issues/41
[issue2]: https://github.com/dydra/support/issues/24
[issue3]: https://github.com/dydra/support/issues/42
[auth]: http://docs.dydra.com/api/authentication
[support]: https://github.com/dydra/support