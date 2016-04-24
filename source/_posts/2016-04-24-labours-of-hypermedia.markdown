---
layout: post
published: true
title: The labours of hypermedia
date: 2016-04-24 15:40
categories:
- dajsiepoznac
- hypermedia
description: There is still a lot of work ahead of hypermedia. This posts lists what we need to succeed with hypermedia APIs
keywords: dajsiepoznac, hypermedia, hydra core vocabulary
comments: true
---

Going full-on with hypermedia takes some preparations and to convince the masses will require some tooling and examples.
Especially tooling. The ability to produce rich developer experience is the determinant of many successful technologies. 
Another crucial factor are real-life uses cases solved by the technology in question. I would like to focus on the former.

As much as the industry has bought into lightweight Web APIs, often inappropriately called RESTful, there has been an uphill
battle to have real hypermedia gain traction. 

<!--more-->

## Why hasn't hypermedia gone mainstream?

I'm still not sure what are the main factors which contribute to the slow adoption of real, unadulterated hypermedia. It
seems that a lot of people find hypermedia hard. Just look at all those question on StackOverflow. There are also a number
of proponents of *pragmatic REST*. In my opinion that mostly means throwing the baby out with bath water. Pragmatic approach
to REST is seen everywhere. 

At the worse end there are for example [REST documentation](/blog/2016/03/rest-misconceptions-5) and [flawed methods of
API versioning](/blog/2016/03/rest-misconceptions-6). To my despair it seems that too many supporters of such practices
completely neglect hypertext and best practices around [URIs](/blog/2016/02/rest-misconceptions-1) and [links](/blog/2016/02/rest-misconceptions-2).

A slightly brighter shade of *pragmatic REST* are the various media types, which actually do put the emphasis on runtime
discoverability. This is not something I will disagree with. Not every API is made equal and not every media type needs
all the features necessary for a complete hypertext-driven interaction. With links to begin with (think [HAL][HAL]),
through forms (supported by [Collection+JSON][coll] for example) all the way to rich ([SIREN][SIREN] or [NARWHL][narwhl])
and extensible ([Hydra Core][hydra]) hypermedia.

An optimistic person could envision a proliferation of cool media types and servers using them. Is this so far from the
truth! I think that there are still a number of puzzles missing which hinders adoption of proper hypermedia.

## The labours of hypermedia
 
Hypermedia has still a long way to go. To make it happen for real there has to be an active community which understands
its benefits and will produce all the necessary moving parts.

1. We must raise **awareness** of the benefits of hypermedia
1. We must define **best practices** around the shady parts of REST such as versioning
1. We need powerful and **extensible media types**
1. We must create the **tooling** around these media types for both server and client side
1. We need a new paradigm for creating **adaptive user interfaces** both of autonomous and bespoke clients
 
In future posts I will try to address these labours and show some of my recipes for actual hypermedia-ness.
 
[HAL]: http://stateless.co/hal_specification.html
[coll]: http://amundsen.com/media-types/collection/
[SIREN]: https://github.com/kevinswiber/siren
[narwhl]: http://www.narwhl.com/
[hydra]: http://hydra-cg.com/spec/latest/core/
[nt]: https://www.w3.org/2001/sw/RDFCore/ntriples/
[n3]: https://www.w3.org/TeamSubmission/n3/
[ld]: http://json-ld.org
[rdfxml]: https://www.w3.org/TR/2014/REC-rdf-syntax-grammar-20140225/
[ttl]: https://www.w3.org/TR/2014/REC-turtle-20140225/