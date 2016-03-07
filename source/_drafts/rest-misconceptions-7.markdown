---
layout: post
published: false
title: REST misconceptions part 7 - Versioning
date: 2016-02-27 21:40
categories:
- rest
- hypermedia
description: Linking is a crucial part of a REST API and here are some examples
comments: true
---

In the third installment of my REST misconceptions series in which I explore hyperlinks. Links are an essential part of 
a REST API as has been written down by Richard Fowler in his article about the [Richardson Maturity Model][rmm3]. Wonder
why links are important? Please, do read on.

<!--more-->

In this series:

1. [Introduction](/blog/2016/02/rest-misconceptions-0)
1. [Misuse of URIs](/blog/2016/02/rest-misconceptions-1)
1. **Not linked enough**
1. Leaky business
1. Resources are application state
1. REST "documentation"
1. Versioning

Like most other problems with REST, a common flawed approach to API versioning stems from [misunderstanding of the URI](/blog/2016/02/rest-misconceptions-1).

Note: actually, versioning might be fine provided a resource only ever lives in a single version