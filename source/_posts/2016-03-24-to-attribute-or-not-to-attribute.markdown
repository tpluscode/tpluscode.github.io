---
layout: post
published: true
title: To [Decorate] or not to [Decorate]
date: 2016-03-24 14:55
categories:
- dajsiepoznac
- c#
- argolis
description: When I use attributes and when I don't and why I don't exactly like my current solution
comments: true
---

Attributes are a very useful feature of many languages but I personally feel that they are used too often and in wrong
circumstances. They're primary shortcoming is the fact that attributes are set up at compile time. During code execution
they can only be read but not modified. 

<!--more-->

## How I use attributes

In [Argolis][argolis] I created a number of attributes to decorate classes which I want to expose in my [Hydra][hydra] API.
I also reuse some attributes from Newtonsoft.Json and core libraries.

{% codeblock lang:c# %}
[SupportedClass("http://example.api/vocab#Issue")]
public class Issue
{
    [Range("http://purl.org/dc/terms/title")]
    [Description("Short description of the problem")]
    public string Title { get; set; }
    
    [ReadOnly(true)]
    [JsonProperty("date")]
    public DateTime DateCreated { get; set; }
}
{% endcodeblock %}

This is used to produce a machine-readable description of a **supported class** on the server, which ensures that the 
client is always using the latest API.

## When I don't use attributes

The above usage seems legit. After all this information is static: the identifiers don't change at runtime, neither does
the general contract.

![puzzle](/uploads/2016/03/puzzle.jpg)

The next piece of my API Documentation puzzle are operations on a resource. In the simplest form they can define whether
given a resource `/users/tpluscode` it is possible to perform `PUT` or `POST` etc.

However, unlike the contract, resource's behaviour is likely to change depending on its state *(eg. it shouldn't be possible
to delete an Issue in progress)* or the current authorized user *(eg. only administrators and owners should be allowed to
delete an issue)*. With this requirement in mind I decided that attributes are not a good choice, because I would have to
somehow bind them with contextual behaviour. That behaviour would live in another type, be passed to the attribute instance
and somehow have to be combined at runtime. (Forgive the hideous class name :wink:)
 
{% codeblock lang:c# %}
[SupportsDeleteOperation(typeof(OnlyIfUserIsAdminOrOwner))]
public class Issue
{
}
{% endcodeblock %}

I don't like the code above, because it pollutes the static nature of attributes. I fear this solution would also lead to
coupling with a higher layer framework - Nancy in my case. Instead I created a basic interface, which is used to gather
information about the available operations and can work nicely with dependency injection inside Nancy or Web API. In
addition I prepared a simple base class, where operation can be wired up and some per-request context injected by the DI
container.

{% codeblock lang:c# %}
public class IssueSupportedOperations : SupportedOperations<Issue>, ISupportedOperations
{
    public IssueSupportedOperations(NancyContextWrapper current)
    {
        Class.SupportsGet();

        if (current.Context.CurrentUser.HasClaim("Admin"))
        {
            Class.SupportsDelete();
        }

        Property(issue => issue.ProjectId).SupportsGet();
    }
}
{% endcodeblock %}

## To `[Decorate]` or not to `[Decorate]`

![puzzle](/uploads/2016/03/roads-split.jpg)

I must say I feel quite dirty nonetheless, because by mixing to solution to complementary features of my library I caused
some sort of duality - part of the API is to use attributes and part is to implement a base class, which the infrastructure
discovers at runtime.

I'm on edge here. It's like mixing [NHibernate attributes](http://nhibernate.info/doc/nhibernate-reference/mapping-attributes.html)
and [Fluent mappings](https://github.com/jagregory/fluent-nhibernate) in the same project. I'd like to hear if people do
also find it a smell or is it acceptable.

[argolis]: http://github.com/wikibus/argolis
[hydra]: http://hydra-cg.com