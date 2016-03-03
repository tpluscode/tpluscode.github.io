---
layout: post
published: false
title: REST misconceptions part 3 - Leaking responsibilities
date: 2016-02-27 21:40
categories:
- rest
- hypermedia
description: Plain links between resources are not enough to implement a rich REST client. The server must supply the clients with a comprehensive metadata about resources and their affordances
comments: true
---

In the fourth part of my REST series I will expand the idea of links. Link are just a stepping stone no matter how important.
Simple links aren't enough for the client to interact with the server. After all how is it going to know when to `POST`
and when to `PUT` or what are the required parameters and request bodies. This is where affordances come into play. It
means that the server should include all information the client needs. Just as defined by the self-descriptive constraint.

<!--more-->

In this series:

1. [Introduction](/blog/2016/02/rest-misconceptions-0)
1. [Misuse of URIs](/blog/2016/02/rest-misconceptions-1)
1. [Not linked enough](/blog/2016/02/rest-misconceptions-2)
1. **Leaky business**
1. Resources are application state
1. REST "documentation"

