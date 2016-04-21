---
layout: post
published: true
title: Nancy Registrations class gotchas
date: 2016-04-08 22:45
categories:
- dajsiepoznac
- nancy
description: Nancy has a great extensibility model but unfortunately it is not yet bulletproof. Here are some problem you might encounter
keywords: dajsiepoznac, nancy, dependency injection, inversion of control
comments: true
---

I [recently wrote](/blog/2016/03/strategy-pattern-nancy/) about the `Registrations` class of NancyFx. It is a great tool
for implementing reusable Nancy packages, which define all their DI requirements and does that with no dependency on any
concrete DI container. 

Unfortunately every rose has its thorns and there are some limitations and the exact behaviour slightly differs between
containers. Read on to see what are the problems you can face when using the `Registrations` class for setting up your 
application.

<!--more-->

## The tests

I tried out numerous bootstrappers for Nancy and I was surprised that I observed different behaviour for different scenarios.
I decided to compile those scenarios as test cases and run them for all available Nancy bootstrapper packages. Each test
uses the `Browser` class from [Nancy.Testing](http://www.marcusoft.net/2013/01/NancyTesting1.html) set up with the tested 
`Bootstrapper`. Then I perform a request to a test `NancyModule` check whether it was injected with correct dependencies.
Unfortunately the tests load all available registrations so they are not exactly independent. To achieve that I should
somehow choose only the relevant type somehow or partition the tests into separate assemblies but I'm not sure it would
be worth the trouble.

The tests are listed in [my repository's readme](https://github.com/tpluscode/Nancy.Boostrapper.Experiments/#the-tests)
so I'm not going to repeat them here. Below I will elaborate on how each of the bootstrappers did.

There are three general categories:

1. Autofac, Ninject, StructureMap and Windsor work in all tested scenarios
1. TinyIoc, DryIoc, LightInject, MEF2 and Unity have some issues
1. Grace and MEF are outdated and don't work with latest Nancy at all

### TinyIoC resolves per-request twice when autoregistration is on

The default bootstrapper scans available assemblies and registers all found types. This doesn't play nice with explicit
registration of all implementations of a type. 

{% codeblock lang:c# %}
public class TestRegistrations : Registrations
{
    public Registrations()
    {
        RegisterAll<ISmth>(Lifetime.PerRequest);
    }
}

public class TestModule : NancyModule
{
    public TestModule(IEnumerable<ISmth> instances)
    {
        // instances will have each implementation twice
    }
}
{% endcodeblock %}

Interestingly this only happens if there is more than one implementation of the injected type. 

### TinyIoC is explicit about registering and resolving collections of type

On the other side of the spectrum for TinyIoC is registering multiple implementations on-by-one. I imagine that it could
be the case where there are multiple implementations of a dependency spread out among multiple libraries. Each lib could
have its own `Registrations` class and register a chosen implementation. It will not be possible to inject them all at
once to another type.

{% codeblock lang:c# %}
public class TestRegistrations : Registrations
{
    public Registrations()
    {
        Register<ISmth>(typeof(SmthImpl1));
        Register<ISmth>(typeof(SmthImpl2));
    }
}

public class TestModule : NancyModule
{
    public TestModule(IEnumerable<ISmth> instances)
    {
        // instances will be empty
    }
}
{% endcodeblock %}

This by design according to the author of TinyIoC and to make this happen `RegisterAll<T>(IEnumerable<Type>)` should be
used instead. When called multiple times it would do the trick.

Curiously this test case passes when autoregistration is on and fails when it is off. That is obviously because they are
found during assembly scanning. TBH it's a good reason to disable autoregistration altogether by default...

### DryIoc fails to inject per-request component into `IRequestStartup`

**UPDATE**: DryIoc works fine in version 2.4. See [this issue](https://github.com/lcssk8board/Nancy.Bootstrappers.DryIoc/issues/2)

<strike>Nancy comes with a handy pair of interfaces `IApplicationStartup` and `IRequestStartup` which when the application boots
up and at each request respectively. Think an alternative to `Global.asax` or WebActivator on steroids.</strike>

<strike>DryIoc currently fails to inject a per-request component into a request startup.</strike>

{% codeblock lang:c# %}
public class RequestStartupRegistrations : Registrations
{
    public RequestStartupRegistrations()
    {
        Register<InjectedIntoRequestStartup>(Lifetime.PerRequest);
    }
}

public class RequestStartupWithPerRequestInjection : IRequestStartup
{
    public RequestStartupWithPerRequestInjection(InjectedIntoRequestStartup injected)
    {
        // this will not work at all - DryIoc throws an exception when resolving
    }

    public void Initialize(IPipelines pipelines, NancyContext context) { }
}
{% endcodeblock %}

<strike>Big up to the author of DryIoc who already works on a solution!</strike>

### MEF2 seems to be lacking functionality

I'm surprised by this bootstrapper. It turns out that `RegisterAll<T>()` has no effect on the registrations and request
startup classes are never even instantiated. I could also check `IApplicationStartup`.

### Windsor and LightInject are different with per-request resolutions

This is not a bug or anything but something to be aware of. (All?) other bootstrapper create a child container for every
request and append additional per-request registrations each time. Windsor and LightInject on the other hand use scopes
and any registrations done directly on the container must be performed in the overridden `ConfigureApplicationContainer`
method.

{% codeblock lang:c# %}
public class LightInjectBootstrapper : LightInjectNancyBootstrapper
{
    protected override void ConfigureApplicationContainer(IServiceContainer existingContainer)
    {
        existingContainer.Register<ISmth, SmthImpl>(new PerScopeLifetime());
    }
}

public class WindsorBootstrapper : WindsorNancyBootstrapper
{
    protected override void ConfigureApplicationContainer(IWindsorContainer existingContainer)
    {
        existingContainer.Register(Component.For<ISmth>().ImplementedBy<SmthImpl>().LifestyleTransient());
    }
}
{% endcodeblock %}

This is very important, because although neither has the companion `ConfigureRequestContainer` method it's easy to make
the mistake of registering dependencies in the `RequestStartup` method instead which will not work. I was ready to blame
Windsor bootstrapper until I read the instructions on the bootstrapper's GitHub readme.

### LightInject and Unity don't like multiple calls to `Register<T>()`

Liking may have little to do with anything but the fact is that attempting to registerer a type multiple times will only
actually register one implementation. Interestingly it's **first wins** with LightInject and **last wins** with Unity. 

{% codeblock lang:c# %}
public class TestRegistrations : Registrations
{
    public Registrations()
    {
        Register<ISmth>(typeof(SmthImpl1));
        Register<ISmth>(typeof(SmthImpl2));
    }
}

public class TestModule : NancyModule
{
    public TestModule(IEnumerable<ISmth> instances)
    {
        // instances will only contain one element
    }
}
{% endcodeblock %}

Although this is by design in both containers this behaviour differs from other bootstrapper. The workaround is to used
named registrations (see [here](http://stackoverflow.com/a/16921451/1103498) and [here](http://stackoverflow.com/a/31655143/1103498))
directly in the bootstrapper.

### LightInject and Unity have additional version requirements

Didn't know how to phrase that :wink:. 

For Unity the problem is the dependency on the actual container package. The bootstrapper works with version 2.* and 3.*
but won't with the latest 4.* release.

The latest LightInject bootstrapper is built for .NET 4.5.1 so if you target .NET <= 4.5 you are out of luck.

## Summary

That's it. I hope someone will find this post helpful when struggling with their Nancy bootstrap. Good luck.
