---
layout: post
published: true
title: Strategy pattern and (one reason) why I love Nancy
date: 2016-03-21 13:30
categories:
- dajsiepoznac
- nancy
- solid
- hypermedia
- argolis
description: Open-closed principle is an important part o SOLID. I this post I present how it can be used to achieve extensibility of a Nancy web application
comments: true
---

The open-closed principle is the second letter of the [SOLID][solid] acronym. SOLID is a set of software design guidelines 
which help build better software. The open-closed principle declares that

> software entities should be open for extension, but closed for modification

One way to satisfy this principle is through the use of the [Strategy design pattern][strat], sometimes called Policy. I'd
like to show how easy it is to employ this pattern in reusable and extensible components for a [Nancy][nancy] application.

<!--more-->

![screwdrivers](/uploads/2016/03/Set_of_security_screw_driver_bits.jpg)

While implementing my [Argolis][Argolis] library I wanted to provide multiple extension points so that the behaviour can
be changed by consumers. For example there is an interface called `ISupportedClassMetaProvider` which return some basic
metadata about the given `Type`. 

{% codeblock lang:c# %}
namespace Hydra.Discovery.SupportedClasses
{
    public interface ISupportedClassMetaProvider
    {
        SupportedClassMeta GetMeta(Type type);
    }
}
{% endcodeblock %}

The default implementation `DefaultSupportedClassMetaProvider` looks at the type name and `[Description]` attribute to
provide default label and description for a documented type. This can be changed by library consumers simply by creating
a custom implementation from scratch, inheriting from the default implementation or decorating it.

## Registering dependencies with Nancy

This is where Nancy comes in with it's magnificent extensibility model. In Nancy there is `IRegistrations` interface and
it's abstract implementation called... `Registrations`. They provide simple abstraction over Dependency Injection, which
is an integral part of Nancy. This abstraction will only let you do basic DI registrations, but it should be enough. Here's
an example setup which registers a shared instance of `IAppSettings` and an implementation of some `IUserContext`, which
will be resolved per-request.

{% codeblock lang:c# %}
public class Registrations : Nancy.Bootstrapper.Registrations
{
    public Registrations()
    {
        Register<IAppSettings>(new WebConfigSettings());
        Register<IUserContext>(typeof(UserContext), Lifetime.PerRequest);
    }
}
{% endcodeblock %}

Nancy will discover implementations of `IRegistrations` at startup and translate `Register<>()` calls to the underlying
container. It is very important because Nancy supports [(m)any dependency injection container(s)][container-support] and
otherwise it would not be possible to create reusable assemblies agnostic of the chosen DI library. 

### Injecting into `Registrations`

Because the very same container is used to create instances of `IRegistrations`, it is even possible to inject into them.

{% codeblock lang:c# %}
public class Registrations : Nancy.Bootstrapper.Registrations
{
    public Registrations(IAppSettings settings)
    {
        if (settings.IsDebug)
            Register<IUserContext>(typeof(TestUserContext), Lifetime.Singleton);
        else
            Register<IUserContext>(typeof(UserContext), Lifetime.PerRequest);
    }
}
{% endcodeblock %}

Depending on the container used however this comes with a limitation that the injected type must either:

* be a concrete type (resolving concrete types automatically is supported eg. by [Unity][unity] or the bundled [TinyIoC][tiny])
* be registered up-front in the [Bootstrapper][bs]

## Providing defaults registrations to consumers

Because Nancy provides a container-agnostic way for registering dependencies and will discover them at startup it is
trivially easy to bundle defaults within a reusable package. In addition to the above it is also possible to register
defaults, which will only be used if no consumer-defined type is found. :tada:

[In Argolis](https://github.com/wikibus/Argolis/blob/master/src/Lernaean.Hydra.Nancy/HydraRegistrations.cs) I have a 
`HydraRegistrations` class, which defines defaults. It is also possible to register multiple implementations of which can
be resolved as `IEnumerable<>`.

Here's an excerpt showing default registration for the `ISupportedClassMetaProvider` and three defaults for
`IPropertyRangeMappingPolicy`.

{% codeblock lang:c# %}
public class HydraRegistrations : Nancy.Bootstrapper.Registrations
{
    public Registrations()
    {
        RegisterWithDefault<ISupportedClassMetaProvider>(typeof(DefaultSupportedClassMetaProvider));
        RegisterWithUserThenDefault<IPropertyRangeMappingPolicy>(new[]
        {
            typeof(XsdDatatypesMappingPolicy),
            typeof(XsdDatatypesNullablesMappingPolicy),
            typeof(SupportedClassRangeMappingPolicy),
        });
    }
}
{% endcodeblock %}

`RegisterWithDefault<>()` means that if not other implementation is found within user code, the type `DefaultSupportedClassMetaProvider`
will be used.

`RegisterWithUserThenDefault<>()` means that the three given types will be used alongside any consumer's implementations.

## Switching the policy

So how does the user provide a different implementation of `ISupportedClassMetaProvider`? The easy way is simply creating
an implementation and it will be registered instead. Alternatively it is possible to create another registrations class
and register there.

{% codeblock lang:c# %}
public class ConsumerRegistrations : Nancy.Bootstrapper.Registrations
{
    public Registrations()
    {
        Register<ISupportedClassMetaProvider>(typeof(MyBetterProvider));
    }
}
{% endcodeblock %}

## Super-duper-happy-path at its best

I can't state enough how much I :sparkling_heart: this. Thanks to the `Registrations` class it is possible to create 
reusable Nancy libraries, which don't require any unnecessary setup. 

No boilerplate, no NuGet (:poop:) code generated from text templates, no DI-container dependency. It is just works out of
the box. :sparkles:

Show me how your .NET web framework does it... :wink:

[solid]: https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)
[strat]: http://www.oodesign.com/strategy-pattern.html
[nancy]: https://github.com/NancyFx/Nancy/
[Argolis]: https://github.com/wikibus/Argolis
[bs]: https://github.com/NancyFx/Nancy/wiki/Bootstrapping-nancy
[tiny]: https://github.com/grumpydev/TinyIoC
[unity]: http://stackoverflow.com/a/3267742/1103498
[container-support]: https://github.com/NancyFx/Nancy/wiki/Container-Support