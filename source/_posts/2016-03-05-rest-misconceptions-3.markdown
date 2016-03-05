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

In the fourth part of my REST series I will expand the idea of links. Links are just a stepping stone no matter how important.
Simple links aren't enough for the client to interact with the server. After all how is it going to know when to `POST`
and when to `PUT` or what are the required parameters and request bodies. This is where affordances come into play. It
means that the server should include all information the client needs. Just as defined by the **self-descriptive** constraint.

<!--more-->

In this series:

1. [Introduction](/blog/2016/02/rest-misconceptions-0)
1. [Misuse of URIs](/blog/2016/02/rest-misconceptions-1)
1. [Not linked enough](/blog/2016/02/rest-misconceptions-2)
1. **Leaky business**
1. Resources are application state
1. REST "documentation"

## Affordances

The word *affordances* derives from the verb *to afford* and simply means what a person (or client) can and cannot do. 
Affordances are a very important aspect of a REST API, because they are precisely what sets it apart from RPC-style APIs.
In an RPC style architecture, the client must know up-front what the interface allows. That information can be provided in
the form of SOAP's WSDL documents, CORBA's IDLs or exposed via a RMI Registry. It is then used by the client to generate 
prograamming objects used to access the remote API as if it was local.

Problems arise when the API evolves, because old clients are at risk of breaking until they are updated with an updated
version of API description. This is not how the Web works. Human browsable HTML document encapsulate all possible interactions
so when the *API* of any given web page changes, it's not necessary to perform any action. A `<form>` for example simply
displays an additional
