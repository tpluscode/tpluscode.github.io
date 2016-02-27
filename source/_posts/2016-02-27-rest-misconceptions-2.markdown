---
layout: post
published: true
title: REST misconceptions part 2 - (Not) Linking data (enough)
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

## REST is about links

REST is defined by Roy Fielding as an

> architectural style for **distributed hypermedia** systems

The word *distributed* is important, because it means that resources are spread across the web, possibly even multiple 
servers or systems. In a REST API these resources are connected by links or hyperlinks, hence the term *hypermedia*. In
practice links must be included in the resource representations, so that clients can follow them to transfer to the next
application state.

Unfortunately many so-called REST APIs don't follow this simple rule.

## Real life links

A good analogy for URI is an address. A physical location of a person's home, work or a doctor's office. Addresses can
be quite complicated and contain many part like street and flat number, floor number, postal code, building name, etc.
Addresses also [vary by country](https://en.wikipedia.org/wiki/Japanese_addressing_system). Try deciphering this address
in Tokyo:
 
> 〒100-8994 <br>
> 東京都中央区八重洲一丁目5番3号 <br>
> 東京中央郵便局

But why would you? This is why online store can work on an international scale: you can just print this on an envelope
and off the letter goes. All you need to know is that the text above is an address, which `links` the seller to the
buyer.

So which is more important, the details of the address or where it actually points?

### A World Wide Web analogy

Another common example is the WWW and how HTML documents are linked. All the browser (and the user by extension) care 
about is the link type, which humans derive from the web page's context. When you see a link to a wikipedia page, you 
can simply click it and the browser takes you there. Neither you nor the browser is too interested about the address 
itself. It simply uses the HTTP protocol to retrieve and display the data.

## REST without links is not REST

A common, infamous example, which calls itself RESTful is [Twitter API][twitter]. It breaks most of the REST constraints,
one of them being lack of links to other resources. To retrieve a user's tweets for instance Twitter exposes the 
`statuses/user_timeline` resource. A complete URI used to retrieve two latest posts of user [tpluscode][tpluscode] is 
`https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=tpluscode&count=2`. *I'm leaving aside the fact that 
including version number and json format is a dubious practice*. Here's an excerpt from the JSON response returned from 
the `user_timeline` resource as shown in [the documentation][timeline-doc]:

``` json
[
  {
    "coordinates": null,
    "favorited": false,
    "truncated": false,
    "created_at": "Wed Aug 29 17:12:58 +0000 2012",
    "id_str": "240859602684612608",
    "entities": {
      // ...
    },
    "in_reply_to_user_id_str": null,
    "contributors": null,
    "text": "Introducing the Twitter Certified Products Program: https://t.co/MjJ8xAnT",
    "retweet_count": 121,
    "in_reply_to_status_id_str": null,
    "id": 240859602684612608,
    "geo": null,
    "retweeted": false,
    "possibly_sensitive": false,
    "in_reply_to_user_id": null,
    "place": null,
    "user": {
      // ...
    },
    "in_reply_to_screen_name": null,
    "source": "<a href="//sites.google.com/site/yorufukurou/%5C%22" rel="\"nofollow\"">YoruFukurou</a>",
    "in_reply_to_status_id": null
  },
  {
    "coordinates": null,
    "favorited": false,
    "truncated": false,
    "created_at": "Sat Aug 25 17:26:51 +0000 2012",
    "id_str": "239413543487819778",
    "entities": {
      // ...
    },
    "in_reply_to_user_id_str": null,
    "contributors": null,
    "text": "We are working to resolve issues with application management & logging in to the dev portal: https://t.co/p5bOzH0k ^TS",
    "retweet_count": 105,
    "in_reply_to_status_id_str": null,
    "id": 239413543487819778,
    "geo": null,
    "retweeted": false,
    "possibly_sensitive": false,
    "in_reply_to_user_id": null,
    "place": null,
    "user": {
      // ...
    },
    "in_reply_to_screen_name": null,
    "source": "<a href="//sites.google.com/site/yorufukurou/%5C%22" rel="\"nofollow\"">YoruFukurou</a>",
    "in_reply_to_status_id": null
  }
]
```

I've removed some of the nested objects for brevity. Do notice the `id`, `in_reply_to_status_id` and `in_reply_to_user_id` 
properties in the two tweets. The latter two are null in the sample representation but both are simple numeric values. 
Having retrieved such response for a GET, **the client has no way to proceed to the next state!**

## The problem: Out-of-band information

Well, you could say that the last sentence isn't true. After all there is the documentation, which [describes how to retrieve
a single status][tweet-doc]. It's as simple as using the `id` as parameter for the `statuses/show/:id` resource:

```
https://api.twitter.com/1.1/statuses/show.json?id=239413543487819778
```

That's great, but it requires the client implementation to be hardcoded against a specific URI pattern. Relying on URI 
structure like this is risky business, which [I mentioned in part one of this series](/blog/2016/02/rest-misconceptions-1).

## REST APIs must be hypertext driven

The above header is the title of [a post][must-be-driven] by Roy Fielding, which is a great read as it sheds light on 
some unclear part of his [dissertation][dissertation]. 

> A REST API **must not define fixed resource names or hierarchies** (an obvious coupling of client and server). Servers 
> must have the freedom to control their own namespace. Instead, allow servers to **instruct clients on how to construct 
> appropriate URIs**, such as is done in HTML forms and URI templates, by defining those instructions within media types 
> and **link relations**.

This passage reveals flaws in the example above. A client of Twitter's API relies on specific URI structure, which will
break shall the server change how it assigns identifiers. Instead of that the client should be coded against a documented
set of relations or links between resources. The most obvious relation is often called the **self relation**. It tells
the client the identifier of any given resource. In the above representations, the values the `id` property could be
changed to contain actual URIs so that the client can simply `GET` it. The `in_reply_to_user_id` and `in_reply_to_status_id` 
properties could become `in_reply_to_user` and `in_reply_to_status` and similarly hold URIs.

``` json
[
  {
    "id": "https://api.twitter.com/1.1/statuses/show.json?id=240859602684612608",
    "in_reply_to_user": "https://api.twitter.com/1.1/users/show.json?screen_name=twitterdev",
    "in_reply_to_status": "https://api.twitter.com/1.1/statuses/show.json?id=5498415978181"
  },
  {
    "id": "https://api.twitter.com/1.1/statuses/show.json?id=239413543487819778",
    "in_reply_to_user": "https://api.twitter.com/1.1/users/show.json?screen_name=tpluscode",
    "in_reply_to_status": "https://api.twitter.com/1.1/statuses/show.json?id=1616516513585"
  }
]
```

### Filling in the blanks

It may not always be possible to give the client complete links. The web already has a standard solution for such 
circumstances called URI templates, which have been standardized in [RFC 6570][rfc6570] and there a readily available 
implementations for many languages. If there is a need to let the client supply a parameter value within a URI, it can 
serve an incomplete URI. For example Twitter could define a `user_search` relation, which allows the client to find users 
by `user_id` or `screen_name` as it currently does:

``` json
{
  "user_search": "https://api.twitter.com/1.1/users/show.json{?user_id,screen_name}"
}
```

How the client knows what are the possible values for the parameters or whether they are required is a different matter
entirely and goes beyond links.

## Is that it?

As far as linking is concerned it actually is. Bottom line is that clients are interested in specific kind of data and 
not details about how to get it (pun intended). 

Of course links are not enough for a complete description of possible client-server interaction. I will expand upon this
subject in the next post.

[rmm3]: http://martinfowler.com/articles/richardsonMaturityModel.html#level3
[twitter]: https://dev.twitter.com/rest
[tpluscode]: http://twitter.com/tpluscode
[timeline-doc]: https://dev.twitter.com/rest/reference/get/statuses/user_timeline
[tweet-doc]: https://dev.twitter.com/rest/reference/get/statuses/show/%3Aid
[must-be-driven]: http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven
[dissertation]: http://presentations.t-code.pl/hateoas/fielding_dissertation.pdf
[rfc6570]: https://tools.ietf.org/html/rfc6570