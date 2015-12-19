---
layout: post
published: true
title: Hypermedia API vs complex processes
date: 2015-12-13 13:30
categories:
- rest
- hypermedia
description: Do Hypermedia APIs need to describe entire processes?
comments: true
---

I the process of preparing my talk at [Boiling Frogs conference][frogs] in Wrocław I've been reading a lot about REST 
and Hypermedia APIs. Just today I came across two interesting [blog][HAMM1] [posts][HAMM2] by [Arnaud Lauret aka API handyman][twitter], 
who proposes a **Hypermedia API Maturity Model** (HAMM). A concept similar to the [Richardson Maturity Model][RMM], but 
applicable only to Level 3 REST APIs. I'd like to share my thoughts on some of the proposal.

<!--more-->

The model proposes a bit-flag scale, which defines a total hypermedia score of any media type
 
* ***01: where can you go***, where API defines links
* ***02: what can you do***, where API defines link methods
* ***04: what you need to do things***, where API describes operation inputs
* ***08: what can't you do and why***, where API gives reason why operation is not available
* ***16: how you do things***, where API describes processes, which consist of multiple actions

The first three are dead simple and no one should argue about them. The fourth is also useful, although it is possible
that not all APIs out there would really need that capability. The last however I think is not necessary. I even consider
the ***how you do things*** criteria, or rather what the media type must include, to be disguised out-of-band information.

## Why define a process in hypermedia?

Isn't that clear? Business processes are complex. Oftentimes it is necessary to perform multiple steps to accomplish a
task. API handyman gives a simple example of Twitter's API, where it is possible to tweet with some media attachment 
(image, video, etc.). It seems logical to do as proposed by defining a "process" link, which describes the steps necessary
to tweet with an attachment and the step, which the client is currently at. Here's the sample interaction as proposed by
Arnaud

1. GET https://api.twitter.com/1.1/
1. discover that to "tweet with media" you must "upload media" (*current step*) and "update status" (two HTTP POST requests)
1. POST https://twitter.com/1.1/media/upload.json
1. in response discover that current step is "update status"
1. POST https://api.twitter.com/1.1/statuses/update.json with media_id in body

You can have a look at the sample payload excerpts on the [original post][HAMM2].

### What's wrong with this approach?

I think that there are a number of potential problems with this whole idea. 

> What is the actual representation of the `uploadMedia` step?
 
The example shows the `_links` but I'm not entirely sure what the representation would actually be. The post mentions 
that the process is initially included with the entrypoint's representation.

> What if I want to upload media but use them for other purpose (ie. in other process)?

Again, this is superficially simple. After all, all that needs doing is include the `https://twitter.com/1.1/media/upload.json`
link in multiple processes. But, what representation would the server return? After all the `upload.json` endpoint doesn't
*know* what process it is part of. That information would have to be included in the endpoint URL or as parameter. For
example `https://twitter.com/1.1/media/upload.json?process={process}`, where the process variable would be replaced by
`tweetWithMedia` or whatever the server accepts. I find this needlessly RPC-like.

Oh, and not to mention that it's easy to imagine APIs where upload is a standalone operation.

> How would I model a more complex process?

I mean, why does the process start with POSTing to an `upload.json` resource anyway? Sure, it is the first step of a business
process. But what if we wanted to upload a media to tweet but instead of updating status, save a draft for later? 

```
uploadMedia ─┬─────────────────────┬─ updateStatus
             │                     │
             └───── saveDraft ─────┘
```

Uh oh, process with branches. Workflow territory warning :warning:. Does it mean that a complete implementation of such 
media type would have to include a DSL for complex workflows? I fear such endeavour would quickly grow out of proportion.

### Process as resource

Roy Fielding [wrote in another context](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven#comment-743) 

> If you find yourself in need of a batch operation,
> then most likely you just haven’t defined enough resources.

I think this is very much applicable to the above example of a process. Unarguably the Twitter API is not RESTful so the
source of inspirations may be poor and my criticism misplaced. Anyhow, this particular, simple process can be modelled 
in a RESTful way without requiring the ***how you do things*** hypermedia requirement from media type. This approach also
overcomes the problems I described above.
 
## How I would model a process

Instead of defining a process and its steps an API should advertise possible state transitions. Each interaction returns
another representation, which has more hypermedia attached. 

On way that comes to my mind as an alternative to the above process is to provide link for both simple tweet and tweet
with attached media. Here's my pseudo-Hydra sample.
 
{% highlight http %}
GET /

{  
  "tweets": {
    "@id": "/tweets",
    "operations": [{
      "method": "POST",
      "parameters: [ /* tweet text, etc. */ ]
   }]
  }, {
    "@id": "/tweetAttachments", 
    "operations": [{
      "method": "POST",
      "mediaType": "multipart/form-data"
    }]
  }
}
{% endhighlight %}

Tweeting is simple as 01 10 11.

{% highlight http %}
POST /tweets
Content-type: application/json

{
  "text": "my tweet text"
}

=>

HTTP 201 Created
Location: /tweets/7bed7868-ee90-43d0-a94c-2062746c4668
{% endhighlight %}

To tweet with attachment we post to the other resource

{% highlight http %}
POST /tweetAttachments

// file content here

=>

HTTP 200 OK

{
  "@id": "/tweetdrafts/222c5081-b9ca-4b42-b146-42eb3112c49a",
  "attachments": {
    "@id": "/tweetdrafts/222c5081-b9ca-4b42-b146-42eb3112c49a/attachments",
    "attachments": [{
      "@id": "/tweetdrafts/222c5081-b9ca-4b42-b146-42eb3112c49a/attachments/my-uploaded-file",
      "operations": [{
        "method": "DELETE"
      }]
    }],
    "operations": [{
      "method": "POST",
      "mediaType": "multipart/form-data"
    }]
  },
  "operations": [{
    "method": "PUT"
    "parameters": [ /* tweet text like above */]
  }]
}
{% endhighlight %}

Deeply nested representation like this may not be easy on the eye. The general idea is tha the client posts to `/tweetAttachments`
and server responds with a freshly created yet unfinished tweet, which has the uploaded media attached. This example 
representation provides the client with various hypermedia controls to delete the attachment, upload another or finally
update the status. 

### REST client is a state machine

You could image a very complex data flow designed in this fashion. Every client's operation returns the next representation
with more possible actions. Simple as that unlike describing all possible paths in the form of a workflow. This is best
put by Roy Fielding himself:

> The model application is therefore an engine that moves from one state to the next 
> by examining and choosing from among the alternative state transitions
> in the current set of representations

Lastly, the client doesn't really have to know that any given request is part of larger process. It also doesn't require any 
broader knowledge about the process itself. That information could be useful for building a rich UI but I don't think it
should be part of a hypermedia maturity model, because it implies that a good hypermedia media type should provide that.

[frogs]: http://boilingfrogs.pl/schedule/hateoas-as-if-you-meant-it/
[HAMM1]: http://apihandyman.io/hypermedia-api-maturity-model-part-i-hypermedia-ness/
[HAMM2]: http://apihandyman.io/hypermedia-api-maturity-model-part-ii-the-missing-links/
[twitter]: https://twitter.com/apihandyman
[RMM]: http://martinfowler.com/articles/richardsonMaturityModel.html