---
layout: post
published: true
title: Cautious with implicit cast operators in structs
date: 2016-03-19 22:55
categories:
- c#
- dajsiepoznac
description: Here's why overloading a cast operator can bite you in the butt
comments: true
---

I find overloading operators a very powerful tool in a programmer's arsenal, yet it seems a very rare practice among C#
developers. I've just got bitten by a simple scenario where an explicit cast operator is a questionable idea.

<!--more-->

In my code I have an `IriRef` class. It's basically a string or Uri wrapped in a structure, which adds semantics required
by my library [JsonLd.Entities][ld-entities] to properly serialize objects to [JSON-LD][JSON-LD]. Here's a excerpt, with 
other stuff removed.

``` c#
public struct IriRef
{
    public IriRef(string value) { Value = value; }
    public IriRef(Uri value) { Value = value.ToString(); }
    
    [JsonProperty(JsonLdKeywords.Id)]
    public string Value { get; }
}
```

As you see it can be constructed from `string` and `Uri` instances. However I don't want to call these constructors every
time so I added two cast operators.

``` c#
public struct IriRef
{
    public static implicit operator IriRef(Uri uri)
    {
        return new IriRef(uri);
    }

    public static explicit operator IriRef(string uriString)
    {
        return new IriRef(uriString);
    }
}        
```

See the difference? `Uri` can be casted implicitly so 

``` c#
// this works
IriRef iriRef = new Uri("http://example.com");

// this doesn't
IriRef iriRef = "http://example.com";
```

I didn't want two `implicit` operator, because while ear Uri will be a valid `IriRef` the same cannot be said about
simple string. Casting a string to `IriRef` must be a conscious decision and the compiler will help a little.

## Here's how this decision bit me

The problem arose when I first used a `Nullable<IriRef>`. The problem is that the implicit cast automatically converts
null values into into an `IriRef`, which means that `IriRef?` will never be null.

``` c#
IriRef? willThisBeNull = null;

// this will fail
Assert.IsNull(willThisBeNull);
```

Very interesting lesson indeed :)

[ld-entities]: http://github.com/wikibus/jsonld.entities
[JSON-LD]: http://json-ld.org